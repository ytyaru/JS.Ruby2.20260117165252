import csv
import os
import sys
import re
from urllib import request, error

# --- 設定 ---
# 正しいベースURL (末尾に余分な /ucd が無い)
UCD_BASE_URL = "https://www.unicode.org/Public/UCD/latest/"
# ファイル名と、ベースURLからの相対的なサブディレクトリ
FILE_LOCATIONS = {
    "Radicals.txt": "Unihan/",  # Radicals.txt は Unihan/ サブディレクトリにある
    "UnicodeData.txt": "ucd/"   # UnicodeData.txt は ucd/ サブディレクトリにある
}
OUTPUT_CSV_FILE = "kangxi_cjk_supplement_mapping_final.csv"

def download_file(filename, subdirectory):
    """Unicodeの公式サイトからデータファイルをダウンロードする"""
    url = UCD_BASE_URL + subdirectory + filename
    if os.path.exists(filename):
        print(f"-> ファイル '{filename}' は既に存在します。ダウンロードをスキップします。")
        return True
    try:
        print(f"-> '{url}' から '{filename}' をダウンロード中...")
        request.urlretrieve(url, filename)
        print(f"-> ダウンロードが完了しました。")
        return True
    except error.HTTPError as e:
        print(f"エラー: '{filename}' のダウンロードに失敗しました。サーバーがエラーを返しました。", file=sys.stderr)
        print(f"  - ステータスコード: {e.code} ({e.reason})", file=sys.stderr)
        print(f"  - URL: {url}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"エラー: '{filename}' のダウンロード中に予期せぬエラーが発生しました: {e}", file=sys.stderr)
        print(f"  - URL: {url}", file=sys.stderr)
        return False

def create_char_to_radical_num_map(filename="Radicals.txt"):
    """Radicals.txt から「統合漢字 -> 康熙部首番号」のマッピングを作成する"""
    mapping = {}
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip() for p in line.split(';')]
            if len(parts) < 3:
                continue
            radical_num = int(parts[0])
            char_code = int(parts[2], 16)
            char = chr(char_code)
            mapping[char] = radical_num
    return mapping

def create_supplement_to_char_map(filename="UnicodeData.txt"):
    """UnicodeData.txt から「CJK部首補助 -> 統合漢字」のマッピングを作成する"""
    mapping = {}
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split(';')
            if len(parts) < 6:
                continue
            code_point = int(parts[0], 16)
            if 0x2E80 <= code_point <= 0x2EFF:
                decomposition_field = parts[5]
                match = re.search(r"<compat> ([0-9A-Fa-f]+)", decomposition_field)
                if match:
                    supplement_char = chr(code_point)
                    target_char_code = int(match.group(1), 16)
                    target_char = chr(target_char_code)
                    mapping[supplement_char] = target_char
    return mapping

def main():
    """メイン処理"""
    print("ステップ1: 必要なUnicodeデータファイルを準備しています...")
    # UnicodeData.txt は ucd/ ディレクトリにあるため、パスを修正
    FILE_LOCATIONS["UnicodeData.txt"] = "ucd/"
    
    for filename, subdir in FILE_LOCATIONS.items():
        if not download_file(filename, subdir):
            sys.exit(1)

    print("\nステップ2: 康熙部首番号と基本漢字のマッピングを作成中...")
    char_to_radical_num = create_char_to_radical_num_map()
    print(f"-> {len(char_to_radical_num)}件のマッピングを生成しました。 (from Radicals.txt)")

    print("\nステップ3: CJK部首補助と対応漢字のマッピングを作成中...")
    supplement_to_char = create_supplement_to_char_map()
    print(f"-> {len(supplement_to_char)}件のマッピングを生成しました。 (from UnicodeData.txt)")

    print("\nステップ4: データを結合してマスターデータを作成中...")
    master_data = []
    for supp_char, target_char in supplement_to_char.items():
        radical_num = char_to_radical_num.get(target_char)
        if radical_num:
            kangxi_radical_code = 0x2F00 + (radical_num - 1)
            master_data.append({
                "kangxi_radical_number": radical_num,
                "kangxi_radical_char": chr(kangxi_radical_code),
                "kangxi_radical_unicode": f"U+{kangxi_radical_code:04X}",
                "cjk_supplement_char": supp_char,
                "cjk_supplement_unicode": f"U+{ord(supp_char):04X}",
            })
    
    print(f"-> {len(master_data)}件の紐付けに成功しました。")

    print(f"\nステップ5: '{OUTPUT_CSV_FILE}' に結果を出力しています...")
    if not master_data:
        print("警告: 出力データが0件です。プログラムのロジックに問題がある可能性があります。", file=sys.stderr)
    
    try:
        with open(OUTPUT_CSV_FILE, "w", newline="", encoding="utf-8") as csvfile:
            fieldnames = [
                "kangxi_radical_number", "kangxi_radical_char", "kangxi_radical_unicode",
                "cjk_supplement_char", "cjk_supplement_unicode"
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sorted(master_data, key=lambda x: (x["kangxi_radical_number"], x["cjk_supplement_unicode"])))
        print(f"\n処理が完了しました！ '{OUTPUT_CSV_FILE}' が作成されました。")
    except IOError as e:
        print(f"エラー: ファイル '{OUTPUT_CSV_FILE}' の書き込みに失敗しました: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()


