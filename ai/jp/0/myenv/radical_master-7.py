import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首マップの作成
    # equiv_map[親漢字] = [変形コード1, ...]
    # inverse_equiv[変形部首] = 親漢字 (変形そのものが親に選ばれるのを防ぐため)
    equiv_map = {}
    inverse_equiv = set()
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            s_list, t_list = [], []
            if '..' in src:
                s_start, s_end = [int(x, 16) for x in src.split('..')]
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_list.append(f"U+{hex(s_start+i).upper()[2:]}")
                    t_list.append(f"U+{hex(t_start+i).upper()[2:]}")
            else:
                s_list, t_list = [f"U+{src.upper()}"], [f"U+{tgt.upper()}"]

            for s, t in zip(s_list, t_list):
                if "U+2E80" <= s <= "U+2EFF":
                    equiv_map.setdefault(t, []).append(s)
                    inverse_equiv.add(s)

    # 2. Unihanから「画数0」の候補を収集
    candidates = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, val = p[0], p[2]
            
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                candidates.setdefault(r_num, []).append(u_code)

    # 3. マスター表の構築
    master_list = []
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    for i in range(1, 215):
        r_str = str(i)
        codes = candidates.get(r_str, [])
        
        # 【重要】適切な親漢字（仲介漢字）の選定
        # 変形部首そのもの（U+4EBB等）が候補に混じっているため、
        # 「変形部首リストに含まれないもの」を最優先で選ぶ
        u_code = "N/A"
        if codes:
            # 1. 変形部首リスト(inverse_equiv)に含まれない、真の親漢字を抽出
            true_parents = [c for c in codes if c not in inverse_equiv]
            
            # 2. その中でも、変形部首の「ターゲット」として登録されているものを優先
            best_candidates = [c for c in true_parents if c in equiv_map]
            
            if best_candidates:
                u_code = sorted(best_candidates, key=lambda x: int(x[2:], 16))[0]
            elif true_parents:
                u_code = sorted(true_parents, key=lambda x: int(x[2:], 16))[0]
            else:
                # 予備：どうしてもなければ最小コード
                u_code = sorted(codes, key=lambda x: int(x[2:], 16))[0]
        
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

    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"完了: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_radical_master()

