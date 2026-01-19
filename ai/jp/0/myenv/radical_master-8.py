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

    # 2. 全漢字の部首番号を収集 (重複を許容してすべてチェック)
    # char_to_radicals[漢字コード] = {部首番号のセット}
    char_to_radicals = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, val = p[0], p[2]
            
            # 残り画数0のものだけを収集
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                char_to_radicals.setdefault(u_code, set()).add(r_num)

    # 3. マスター表の構築 (1番〜214番)
    master_list = []
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    # 214部首の標準的な親漢字リスト（Unihanのノイズに左右されないための最終手段）
    # これがないと、変形文字そのものが親に選ばれる事故が防げません
    for i in range(1, 215):
        r_str = str(i)
        
        # 部首番号 i に属し、かつ画数0である漢字をすべてリストアップ
        candidates = [c for c, rads in char_to_radicals.items() if r_str in rads]
        
        # 仲介漢字の選定
        # A. 変形部首(equiv_map)のターゲットになっているものを最優先
        # B. なければ最小のコードポイントを選択
        u_code = "N/A"
        if candidates:
            matches = [c for c in candidates if c in equiv_map]
            if matches:
                u_code = sorted(matches, key=lambda x: int(x[2:], 16))[0]
            else:
                u_code = sorted(candidates, key=lambda x: int(x[2:], 16))[0]
        
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

    print(f"作成完了: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_radical_master()

