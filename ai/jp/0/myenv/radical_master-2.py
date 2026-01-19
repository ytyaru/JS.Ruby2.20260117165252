import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首と常用漢字の対応を読み込む
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or ';' not in line:
                continue
            
            # コメントを除去し、コード部分を分離
            parts = line.split('#')[0].split(';')
            source_part = parts[0].strip()  # 例: "2E8C..2E8D" または "2EA5"
            target_part = parts[1].strip()  # 例: "5DDB"
            
            # 常用漢字（ターゲット）側を U+ 形式に整形
            target_code = f"U+{target_part.upper()}"
            
            # ソース側が範囲指定 "XXXX..YYYY" の場合
            if '..' in source_part:
                start_hex, end_hex = source_part.split('..')
                for code_int in range(int(start_hex, 16), int(end_hex, 16) + 1):
                    source_hex = hex(code_int).upper().replace('0X', '')
                    if "2E80" <= source_hex <= "2EFF":
                        equiv_map[target_code] = f"U+{source_hex}"
            else:
                if "2E80" <= source_part <= "2EFF":
                    equiv_map[target_code] = f"U+{source_part.upper()}"

    # 2. 常用漢字と部首番号の対応を読み込む
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line:
                continue
            parts = line.strip().split('\t')
            if len(parts) < 3:
                continue
            
            char_code = parts[0].strip()   # U+6C34
            radical_info = parts[2].strip() # 85.0
            
            # 残り画数0（部首そのもの）を優先
            if radical_info.endswith('.0'):
                radical_num = radical_info.split('.')[0]
                if radical_num not in radical_to_unified:
                    radical_to_unified[radical_num] = char_code

    # 3. マスター表の作成
    master_list = []
    fieldnames = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    for i in range(1, 215):
        radical_num = str(i)
        unified_code = radical_to_unified.get(radical_num, "N/A")
        cjk_sub_code = equiv_map.get(unified_code, "N/A")
        
        # 文字の変換処理（エラー回避付き）
        try:
            unified_char = chr(int(unified_code[2:], 16)) if unified_code != "N/A" else ""
            cjk_sub_char = chr(int(cjk_sub_code[2:], 16)) if cjk_sub_code != "N/A" else ""
            kangxi_hex = 0x2F00 + i - 1
            kangxi_char = chr(kangxi_hex)
            kangxi_char_code = f"U+{hex(kangxi_hex).upper()[2:]}"
        except (ValueError, IndexError):
            unified_char = cjk_sub_char = ""
            kangxi_char = ""
            kangxi_char_code = "N/A"

        master_list.append({
            '康熙部首番号': radical_num,
            '康熙部首文字': kangxi_char,
            '康熙部首コード': kangxi_char_code,
            '仲介常用漢字': unified_char,
            '常用漢字コード': unified_code,
            'CJK部首補助': cjk_sub_char,
            'CJK部首補助コード': cjk_sub_code
        })

    # 4. CSV出力
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE} を作成しました。")

if __name__ == "__main__":
    create_radical_master()

