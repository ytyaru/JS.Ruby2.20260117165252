import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. CJK部首補助の対応マップ作成
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            s_list, t_list = [], []
            if '..' in src:
                s_start, s_end = int(src.split('..')[0], 16), int(src.split('..')[1], 16)
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_list.append(f"U+{hex(s_start+i).upper()[2:]}")
                    t_list.append(f"U+{hex(t_start+i).upper()[2:]}")
            else:
                s_list, t_list = [f"U+{src.upper()}"], [f"U+{tgt.upper()}"]

            for s, t in zip(s_list, t_list):
                if "U+2E80" <= s <= "U+2EFF":
                    equiv_map.setdefault(t, []).append(s)

    # 2. 214部首の「正解の親漢字」を定義 (Unihanの揺れを排除するマスター)
    # これにより「人」の親が「亻」になるようなミスを防ぎます
    # (Unicode Radical-Stroke Indexの定義に基づく)
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, val = p[0], p[2]
            
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                # すでに登録がある場合は、コードポイントが小さい方を「伝統的な親」として残す
                # ただし、equiv_mapに登録されている（変形を持つ）漢字が見つかったらそれを最優先する
                if r_num not in radical_to_unified:
                    radical_to_unified[r_num] = u_code
                else:
                    current_code = radical_to_unified[r_num]
                    # 今見つけた漢字が変形のターゲットなら、無条件で優先
                    if u_code in equiv_map and current_code not in equiv_map:
                        radical_to_unified[r_num] = u_code
                    # 両方変形ターゲット、または両方非ターゲットなら、コードが若い方
                    elif (u_code in equiv_map) == (current_code in equiv_map):
                        if int(u_code[2:], 16) < int(current_code[2:], 16):
                            radical_to_unified[r_num] = u_code

    # 3. マスター表の構築 (214部首分)
    master_list = []
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    for i in range(1, 215):
        r_str = str(i)
        u_code = radical_to_unified.get(r_str, "N/A")
        
        c_codes = equiv_map.get(u_code, [])
        c_chars = "".join([chr(int(c[2:], 16)) for c in c_codes])
        c_codes_str = ",".join(c_codes) if c_codes else "N/A"
        
        try:
            u_char = chr(int(u_code[2:], 16)) if u_code != "N/A" else "N/A"
            kx_cp = 0x2F00 + i - 1
            kx_char = chr(kx_cp)
            kx_code = f"U+{hex(kx_cp).upper()[2:]}"
        except:
            u_char = "N/A"
            kx_char = ""
            kx_code = "N/A"

        master_list.append({
            '康熙部首番号': r_str,
            '康熙部首文字': kx_char,
            '康熙部首コード': kx_code,
            '仲介常用漢字': u_char,
            '常用漢字コード': u_code,
            'CJK部首補助': c_chars,
            'CJK部首補助コード': c_codes_str
        })

    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_radical_master()

