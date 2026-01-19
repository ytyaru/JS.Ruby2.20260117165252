import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 変形部首マップの作成 (親漢字 -> [変形リスト])
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#').strip()
            if not line or ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            # 範囲指定(2E8C..2E8D ; 5DDB)の展開
            s_codes, t_codes = [], []
            if '..' in src:
                s_start, s_end = int(src.split('..'), 16), int(src.split('..'), 16)
                t_start = int(tgt, 16)
                for i in range(s_end - s_start + 1):
                    s_codes.append(f"U+{hex(s_start + i).upper()[2:]}")
                    t_codes.append(f"U+{hex(t_start + i).upper()[2:]}")
            else:
                s_codes, t_codes = [f"U+{src.upper()}"], [f"U+{tgt.upper()}"]

            for s, t in zip(s_codes, t_codes):
                # CJK部首補助(U+2E80-2EFF)のみを対象とする
                if "U+2E80" <= s <= "U+2EFF":
                    equiv_map.setdefault(t, []).append(s)

    # 2. 214部首ごとの「正しい仲介常用漢字」を特定
    # Unihanから、画数0の漢字を「常用漢字の範囲(U+4E00-U+9FFF)」からのみ抽出
    # 部首記号(U+2E80-, U+2F00-)を親に選ばないようにする
    radical_to_parent = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            p = line.strip().split('\t')
            if len(p) < 3: continue
            u_code, r_info = p, p
            
            if r_info.endswith('.0'):
                r_num = r_info.split('.').replace("'", "")
                cp = int(u_code[2:], 16)
                
                # 仲介漢字は「統合漢字（常用漢字）」の範囲から選ぶ
                # CJK統合漢字(U+4E00-U+9FFF) または CJK統合漢字拡張
                if 0x4E00 <= cp <= 0x9FFF or 0x3400 <= cp <= 0x4DBF:
                    # すでに登録がある場合、変形部首の親として登録がある方を優先
                    if r_num not in radical_to_parent:
                        radical_to_parent[r_num] = u_code
                    else:
                        existing = radical_to_parent[r_num]
                        # 新しい候補が変形対応表にあるなら上書き
                        if u_code in equiv_map and existing not in equiv_map:
                            radical_to_parent[r_num] = u_code
                        # 両方にある/ない場合は、コードポイントが小さい方（基本文字）を優先
                        elif (u_code in equiv_map) == (existing in equiv_map):
                            if cp < int(existing[2:], 16):
                                radical_to_parent[r_num] = u_code

    # 3. マスター作成
    master_list = []
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    
    for i in range(1, 215):
        r_str = str(i)
        u_code = radical_to_parent.get(r_str, "N/A")
        
        # 変形データの紐付け
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

    print(f"完了: {OUTPUT_FILE} を作成しました。")

if __name__ == "__main__":
    create_radical_master()

