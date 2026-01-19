import re
import csv

# ファイルパス（同じディレクトリに置いている前提）
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首と常用漢字の対応を読み込む (EquivalentUnifiedIdeograph.txt)
    # mapping[常用漢字コード] = CJK部首補助コード
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('#') or ';' not in line:
                continue
            # 2E85 ; 4EBA # (⺅ => 人) のような行を分割
            parts = line.split('#')[0].split(';')
            cjk_radical_code = parts[0].strip()
            unified_ideograph_code = parts[1].strip()
            
            # CJK部首補助の範囲 (U+2E80..U+2EFF) のみを対象にする
            if "2E80" <= cjk_radical_code <= "2EFF":
                equiv_map[f"U+{unified_ideograph_code}"] = f"U+{cjk_radical_code}"

    # 2. 常用漢字と部首番号の対応を読み込む (Unihan_IRGSources.txt)
    # radical_to_unified[部首番号] = 常用漢字コード
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line:
                continue
            
            # U+6C34	kRSUnicode	85.0 のような行をタブで分割
            parts = line.strip().split('\t')

            # エラー回避のためのチェック：partsリストが3つ以上の要素を持っているか確認
            if len(parts) < 3:
                continue # 要素が足りない行はスキップ
                
            char_code = parts[0].strip() # U+6C34
            radical_info = parts[2].strip() # 85.0
            
            # 残り画数が0（部首そのもの）の漢字を優先的に取得
            if radical_info.endswith('.0'):
                radical_num = radical_info.split('.')[0]
                # 既に登録があっても上書きせず、最小のコード（基本文字）を優先
                if radical_num not in radical_to_unified:
                    radical_to_unified[radical_num] = char_code

    # 3. データを結合してマスター表を作成
    master_list = []
    # 康熙部首は1番から214番まで
    for i in range(1, 215):
        radical_num = str(i)
        unified_code = radical_to_unified.get(radical_num, "N/A")
        # 常用漢字コードをキーにして変形部首コードを引く
        cjk_sub_code = equiv_map.get(unified_code, "N/A")
        
        # 実際の文字も確認用に生成
        unified_char = chr(int(unified_code[2:], 16)) if unified_code != "N/A" else ""
        cjk_sub_char = chr(int(cjk_sub_code[2:], 16)) if cjk_sub_code != "N/A" else ""
        # 康熙部首ブロック (U+2F00-) の文字も計算で算出 (1番=U+2F00)
        kangxi_char_code = hex(0x2F00 + i - 1).upper().replace('0X', 'U+')
        kangxi_char = chr(0x2F00 + i - 1)

        master_list.append({
            '康熙部首番号': radical_num,
            '康熙部首文字': kangxi_char,
            '康熙部首コード': kangxi_char_code,
            '仲介常用漢字': unified_char,
            '常用漢字コード': unified_code,
            'CJK部首補助': cjk_sub_char,
            'CJK部首補助コード': cjk_sub_code
        })

    # 4. CSVファイルに出力
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=master_list.keys())
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE} を作成しました。")

if __name__ == "__main__":
    create_radical_master()
