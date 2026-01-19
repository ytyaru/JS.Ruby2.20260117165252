import csv

# ファイル名はDLしたものと一致させてください
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首マップの作成 (EquivalentUnifiedIdeograph.txt)
    # equiv_map[常用漢字コード] = [変形部首コードのリスト]
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if not line or ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            s_list = []
            t_list = []
            if '..' in src:
                s_start, s_end = int(src.split('..')[0], 16), int(src.split('..')[1], 16)
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_list.append(f"U+{hex(s_start+i).upper()[2:]}")
                    t_list.append(f"U+{hex(t_start+i).upper()[2:]}")
            else:
                s_list, t_list = [f"U+{src.upper()}"], [f"U+{tgt.upper()}"]

            for s, t in zip(s_list, t_list):
                # CJK部首補助の範囲のみ抽出
                if "U+2E80" <= s <= "U+2EFF":
                    equiv_map.setdefault(t, []).append(s)

    # 2. 親漢字の特定 (Unihan_IRGSources.txt)
    # 214部首それぞれに対し、正しい親漢字(U+XXXX)を1つだけ選定する
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            parts = line.strip().split('\t')
            if len(parts) < 3: continue
            
            u_code = parts[0]    # 例: U+6C34
            val = parts[2]       # 例: 85.0
            
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                
                # 判定ロジック:
                # すでに登録がある場合、変形部首(equiv_map)の親として登録されている方を絶対優先する
                if r_num not in radical_to_unified:
                    radical_to_unified[r_num] = u_code
                else:
                    current_u = radical_to_unified[r_num]
                    # 新しい方が変形親なら上書き
                    if u_code in equiv_map and current_u not in equiv_map:
                        radical_to_unified[r_num] = u_code
                    # どちらも変形親、またはどちらも非親なら、コードが小さい方（基本漢字）を保持
                    elif (u_code in equiv_map) == (current_u in equiv_map):
                        if int(u_code[2:], 16) < int(current_u[2:], 16):
                            radical_to_unified[r_num] = u_code

    # 3. マスター表作成
    master_list = []
    for i in range(1, 215):
        r_str = str(i)
        u_code = radical_to_unified.get(r_str, "N/A")
        
        c_codes = equiv_map.get(u_code, [])
        c_chars = "".join([chr(int(c[2:], 16)) for c in c_codes])
        c_codes_str = ",".join(c_codes) if c_codes else "N/A"
        
        u_char = chr(int(u_code[2:], 16)) if u_code != "N/A" else "N/A"
        kx_cp = 0x2F00 + i - 1

        master_list.append({
            '康熙部首番号': r_str,
            '康熙部首文字': chr(kx_cp),
            '康熙部首コード': f"U+{hex(kx_cp).upper()[2:]}",
            '仲介常用漢字': u_char,
            '常用漢字コード': u_code,
            'CJK部首補助': c_chars,
            'CJK部首補助コード': c_codes_str
        })

    # 4. CSV出力
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了しました。{OUTPUT_FILE} を確認してください。")

if __name__ == "__main__":
    create_radical_master()

