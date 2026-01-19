import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首と常用漢字の対応を読み込む
    # 同一の常用漢字(Unified)に複数の変形(CJK)が紐付くため、リストで保持する
    # equiv_map[U+常用漢字] = [U+変形1, U+変形2, ...]
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            # コメント削除とクリーニング
            line = line.split('#')[0].strip()
            if not line or ';' not in line:
                continue
            
            parts = line.split(';')
            source_part = parts[0].strip()  # 例: "2E85" または "2E8C..2E8D"
            target_part = parts[1].strip()  # 例: "4EBA" または "5DDB"
            
            # ソース（変形部首）が範囲指定の場合
            if '..' in source_part:
                s_start, s_end = source_part.split('..')
                t_start = int(target_part, 16)
                for i, code_int in enumerate(range(int(s_start, 16), int(s_end, 16) + 1)):
                    # 範囲指定の場合、ターゲット側も連番で対応している
                    s_hex = f"U+{hex(code_int).upper()[2:]}"
                    t_hex = f"U+{hex(t_start + i).upper()[2:]}"
                    if "U+2E80" <= s_hex <= "U+2EFF":
                        equiv_map.setdefault(t_hex, []).append(s_hex)
            else:
                s_hex = f"U+{source_part.upper()}"
                t_hex = f"U+{target_part.upper()}"
                if "U+2E80" <= s_hex <= "U+2EFF":
                    equiv_map.setdefault(t_hex, []).append(s_hex)

    # 2. 常用漢字と部首番号の対応を読み込む
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line:
                continue
            parts = line.strip().split('\t')
            if len(parts) < 3:
                continue
            
            char_code = parts[0]   # U+6C34
            radical_info = parts[2] # 85.0
            
            # 残り画数0（部首そのもの）を優先。例: "85.0"
            if radical_info.endswith('.0'):
                # 簡体字部首などの補助番号（'）を除去して純粋な番号のみ取得
                radical_num = radical_info.split('.')[0].replace("'", "")
                if radical_num not in radical_to_unified:
                    radical_to_unified[radical_num] = char_code

    # 3. マスター表の作成
    master_list = []
    fieldnames = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    for i in range(1, 215):
        r_num = str(i)
        u_code = radical_to_unified.get(r_num, "N/A")
        
        # 変形部首リストを取得（なければ空リスト）
        cjk_codes = equiv_map.get(u_code, [])
        
        # 1つの部首に複数の変形がある場合、カンマ区切りで結合する
        cjk_chars = "".join([chr(int(c[2:], 16)) for c in cjk_codes])
        cjk_codes_str = ",".join(cjk_codes) if cjk_codes else "N/A"
        
        try:
            u_char = chr(int(u_code[2:], 16)) if u_code != "N/A" else ""
            kx_hex = 0x2F00 + i - 1
            kx_char = chr(kx_hex)
            kx_code = f"U+{hex(kx_hex).upper()[2:]}"
        except:
            u_char = ""
            kx_char = ""
            kx_code = "N/A"

        master_list.append({
            '康熙部首番号': r_num,
            '康熙部首文字': kx_char,
            '康熙部首コード': kx_code,
            '仲介常用漢字': u_char,
            '常用漢字コード': u_code,
            'CJK部首補助': cjk_chars,
            'CJK部首補助コード': cjk_codes_str
        })

    # 4. CSV出力
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE} を作成しました。")

if __name__ == "__main__":
    create_radical_master()

