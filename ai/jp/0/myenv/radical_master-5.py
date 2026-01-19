import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首マップの作成 (EquivalentUnifiedIdeograph.txt)
    # equiv_map[親漢字コード] = [変形コードリスト]
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            s_list = []
            t_list = []
            if '..' in src:
                s_start, s_end = [int(x, 16) for x in src.split('..')]
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_list.append(f"U+{hex(s_start + i).upper()[2:]}")
                    t_list.append(f"U+{hex(t_start + i).upper()[2:]}")
            else:
                s_list = [f"U+{src.upper()}"]
                t_list = [f"U+{tgt.upper()}"]

            for s_code, t_code in zip(s_list, t_list):
                if "U+2E80" <= s_code <= "U+2EFF":
                    equiv_map.setdefault(t_code, []).append(s_code)

    # 2. 部首番号と「正しい親漢字」の対応表
    # Unicodeの定義では、各部首に対応する「Unified Ideograph」が決まっています。
    # Unihanデータから、画数0の漢字のうち「変形部首のターゲット」になっているものを優先します。
    radical_to_unified = {}
    
    # 一旦、画数0の漢字をすべて収集
    candidates = {} # {部首番号: [漢字コード, ...]}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, val = p[0], p[2]
            
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                candidates.setdefault(r_num, []).append(u_code)

    # 収集した候補から「変形部首の親」として登録されているコードを優先して選ぶ
    for r_num, codes in candidates.items():
        # 変形部首マップに存在するコードを優先
        best_match = codes[0]
        for c in codes:
            if c in equiv_map:
                best_match = c
                break
        radical_to_unified[r_num] = best_match

    # 3. マスター表の構築 (214部首分)
    master_list = []
    for i in range(1, 215):
        r_str = str(i)
        u_code = radical_to_unified.get(r_str, "N/A")
        
        # 変形情報の取得
        cjk_codes = equiv_map.get(u_code, [])
        cjk_chars = "".join([chr(int(c[2:], 16)) for c in cjk_codes])
        cjk_codes_str = ",".join(cjk_codes) if cjk_codes else "N/A"
        
        # 康熙部首文字 (U+2F00-)
        kx_cp = 0x2F00 + i - 1
        u_char = chr(int(u_code[2:], 16)) if u_code != "N/A" else "N/A"

        master_list.append({
            '康熙部首番号': r_str,
            '康熙部首文字': chr(kx_cp),
            '康熙部首コード': f"U+{hex(kx_cp).upper()[2:]}",
            '仲介常用漢字': u_char,
            '常用漢字コード': u_code,
            'CJK部首補助': cjk_chars,
            'CJK部首補助コード': cjk_codes_str
        })

    # 4. CSV出力
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_radical_master()

