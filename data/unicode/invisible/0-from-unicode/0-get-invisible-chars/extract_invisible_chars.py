import urllib.request
import os
import re
from collections import defaultdict

def download_ucd_file(filename, version="latest"):
    """
    Unicode Character Database (UCD)からファイルをダウンロードする。
    """
    base_url = f"https://www.unicode.org/Public/UCD/{version}/ucd/"
    url = base_url + filename
    if not os.path.exists(filename):
        print(f"{filename} をダウンロード中...")
        try:
            urllib.request.urlretrieve(url, filename)
            print("ダウンロード完了。")
        except urllib.error.URLError as e:
            print(f"エラー: {filename} のダウンロードに失敗しました。")
            print(e)
            return False
    return True

def parse_ucd_range_file(filename, property_name):
    """
    コードポイントの範囲とプロパティが記述されたUCDファイルをパースする。
    例: PropList.txt, DerivedCoreProperties.txt
    """
    codepoints = set()
    if not download_ucd_file(filename):
        return codepoints

    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # コメント部分を除去
            if '#' in line:
                line = line.split('#')[0].strip()

            parts = [p.strip() for p in line.split(';')]
            if len(parts) < 2 or parts[1] != property_name:
                continue

            codepoint_range = parts[0]
            if '..' in codepoint_range:
                start, end = [int(p, 16) for p in codepoint_range.split('..')]
                for cp in range(start, end + 1):
                    codepoints.add(cp)
            else:
                codepoints.add(int(codepoint_range, 16))
    
    print(f"{filename} から {property_name} プロパティを持つ文字を {len(codepoints)} 個読み込みました。")
    return codepoints

def get_general_categories():
    """
    UnicodeData.txt をパースして、各コードポイントのGeneral_Categoryを取得する。
    """
    filename = "UnicodeData.txt"
    categories = {}
    if not download_ucd_file(filename):
        return categories

    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split(';')
            if len(parts) > 2:
                codepoint = int(parts[0], 16)
                name = parts[1]
                category = parts[2]
                
                # 範囲指定の開始文字 (<..., First>)
                if name.endswith(", First>"):
                    # 次の行が範囲の終了文字のはず
                    next_line = next(f, None)
                    if next_line:
                        end_parts = next_line.strip().split(';')
                        end_codepoint = int(end_parts[0], 16)
                        for cp in range(codepoint, end_codepoint + 1):
                            categories[cp] = category
                else:
                    categories[codepoint] = category
    
    print(f"{filename} からGeneral_Category情報を読み込みました。")
    return categories

def main():
    """
    メイン処理
    """
    # --- 抽出条件の定義 ---
    target_categories = {
        'Cc',  # Other, Control
        'Cf',  # Other, Format
        'Cs',  # Other, Surrogate
        'Cn',  # Other, Not Assigned
        'Mn',  # Mark, Nonspacing
        'Zl',  # Separator, Line
        'Zp',  # Separator, Paragraph
        'Zs',  # Separator, Space
    }

    # --- データの準備 ---
    # 各プロパティを持つコードポイントのセットを取得
    white_space_cps = parse_ucd_range_file("PropList.txt", "White_Space")
    # DerivedCoreProperties.txt にも White_Space の定義がある場合がある
    white_space_cps.update(parse_ucd_range_file("DerivedCoreProperties.txt", "White_Space"))
    
    def_ignorable_cps = parse_ucd_range_file("DerivedCoreProperties.txt", "Default_Ignorable_Code_Point")
    
    # 全コードポイントのGeneral_Categoryを取得
    general_categories = get_general_categories()

    # --- 不可視文字の抽出 ---
    invisible_chars = set()
    
    # Unicodeの全範囲 (0x000000 - 0x10FFFF) をチェック
    for cp in range(0x110000):
        # 条件1: General_Category が対象のいずれか
        category = general_categories.get(cp, 'Cn') # 未定義はCnとして扱う
        if category in target_categories:
            invisible_chars.add(cp)
            continue
            
        # 条件2: White_Space プロパティが true
        if cp in white_space_cps:
            invisible_chars.add(cp)
            continue

        # 条件3: Default_Ignorable_Code_Point プロパティが true
        if cp in def_ignorable_cps:
            invisible_chars.add(cp)
            continue

    # --- ファイルへの出力 ---
    output_filename = "invisible-chars.txt"
    sorted_invisible_chars = sorted(list(invisible_chars))
    
    try:
        with open(output_filename, 'w', encoding='utf-8', newline='\n') as f:
            for cp in sorted_invisible_chars:
                # コードポイントを16進数文字列（大文字、プレフィックスなし）に変換
                hex_cp = format(cp, 'X')
                f.write(f"{hex_cp}\n")
        
        print(f"\n抽出した不可視文字 {len(sorted_invisible_chars)} 個を {output_filename} に出力しました。")

    except IOError as e:
        print(f"エラー: ファイル '{output_filename}' の書き込みに失敗しました。")
        print(e)

if __name__ == "__main__":
    main()
