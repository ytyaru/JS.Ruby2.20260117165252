import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首マップの作成
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if not line or ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            # 範囲指定の展開 (2E8C..2E8D => 5DDB)
            if '..' in src:
                s_start, s_end = int(src.split('..')[0], 16), int(src.split('..')[1], 16)
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_hex = f"U+{hex(s_start + i).upper()[2:]}"
                    t_hex = f"U+{hex(t_start + i).upper()[2:]}"
                    if "U+2E80" <= s_hex <= "U+2EFF":
                        equiv_map.setdefault(t_hex, []).append(s_hex)
            else:
                s_hex, t_hex = f"U+{src.upper()}", f"U+{tgt.upper()}"
                if "U+2E80" <= s_hex <= "U+2EFF":
                    equiv_map.setdefault(t_hex, []).append(s_hex)

    # 2. 214部首の「正解の親漢字」の自動特定（アルゴリズム改善）
    # Unihanから部首番号ごとの候補をすべて取得
    radical_candidates = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, r_info = p[0], p[2]
            if r_info.endswith('.0'):
                r_num = r_info.split('.')[0].replace("'", "")
                radical_candidates.setdefault(r_num, set()).add(u_code)

    # 3. マスター作成
    master_list = []
    for i in range(1, 215):
        r_str = str(i)
        codes = radical_candidates.get(r_str, [])
        
        # 親漢字の選定ロジック:
        # 1. その漢字自体が変形対応表の「ターゲット」であるものを最優先 (人, 水, 心 等)
        # 2. かつ、その漢字自体が「CJK部首補助(U+2E80-)」や「康熙部首(U+2F00-)」ブロックに属さないもの(常用漢字)を選ぶ
        best_u = "N/A"
        if codes:
            # 常用漢字の範囲(U+4E00-)にあるものを抽出
            ideographs = [c for c in codes if int(c[2:], 16) >= 0x4E00]
            # 変形親として登録があるものを優先
            matches = [c for c in ideographs if c in equiv_map]
            if matches:
                best_u = sorted(matches, key=lambda x: int(x[2:], 16))[0]
            elif ideographs:
                best_u = sorted(ideographs, key=lambda x: int(x[2:], 16))[0]
            else:
                best_u = sorted(list(codes), key=lambda x: int(x[2:], 16))[0]

        # 出力用データ整形
        cjk_codes = equiv_map.get(best_u, [])
        cjk_chars = "".join([chr(int(c[2:], 16)) for c in cjk_codes])
        cjk_codes_str = ",".join(cjk_codes) if cjk_codes else "N/A"
        
        u_char = chr(int(best_u[2:], 16)) if best_u != "N/A" else "N/A"
        kx_cp = 0x2F00 + i - 1

        master_list.append({
            '康熙部首番号': r_str,
            '康熙部首文字': chr(kx_cp),
            '康熙部首コード': f"U+{hex(kx_cp).upper()[2:]}",
            '仲介常用漢字': u_char,
            '常用漢字コード': best_u,
            'CJK部首補助': cjk_chars,
            'CJK部首補助コード': cjk_codes_str
        })

    # CSV出力
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"214部首のマスターを {OUTPUT_FILE} に作成しました。")

if __name__ == "__main__":
    create_radical_master()

