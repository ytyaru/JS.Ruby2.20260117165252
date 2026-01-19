import csv

# ファイルパス
UNIHAN_FILE = 'Unihan_IRGSources.txt'
EQUIV_FILE = 'EquivalentUnifiedIdeograph.txt'
OUTPUT_FILE = 'radical_master_2026.csv'

def create_radical_master():
    # 1. 康熙部首の対応表をあらかじめ作成 (214部首)
    # Unicodeの康熙部首ブロック(U+2F00-U+2FD5)は部首番号順に並んでいる
    kangxi_map = {}
    for i in range(1, 215):
        cp = 0x2F00 + i - 1
        kangxi_map[str(i)] = {
            '文字': chr(cp),
            'コード': f"U+{(hex(cp).upper()[2:])}"
        }

    # 2. 変形部首のマップ作成 (EquivalentUnifiedIdeograph.txt)
    # equiv_map[親漢字コード] = [変形文字リスト]
    equiv_map = {}
    with open(EQUIV_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.split('#')[0].strip()
            if ';' not in line: continue
            src, tgt = [x.strip() for x in line.split(';')]
            
            # 範囲指定の展開
            sources = []
            targets = []
            if '..' in src:
                s_start, s_end = [int(x, 16) for x in src.split('..')]
                t_start = int(tgt, 16)
                for j in range(s_end - s_start + 1):
                    sources.append(f"U+{hex(s_start + j).upper()[2:]}")
                    targets.append(f"U+{hex(t_start + j).upper()[2:]}")
            else:
                sources = [f"U+{src.upper()}"]
                targets = [f"U+{tgt.upper()}"]

            for s_code, t_code in zip(sources, targets):
                # CJK部首補助(U+2E80-U+2EFF)のみ抽出
                if "U+2E80" <= s_code <= "U+2EFF":
                    equiv_map.setdefault(t_code, []).append(s_code)

    # 3. 部首番号と親漢字の紐付け (Unihan_IRGSources.txt)
    # 214部首それぞれの「親となる漢字」を特定する
    radical_to_unified = {}
    with open(UNIHAN_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            if 'kRSUnicode' not in line: continue
            parts = line.strip().split('\t')
            if len(parts) < 3: continue
            
            u_code = parts[0]   # 例: U+6C34
            val = parts[2]      # 例: 85.0
            
            if val.endswith('.0'):
                r_num = val.split('.')[0].replace("'", "")
                # 部首そのものを示す漢字は、統合漢字（常用漢字）の範囲から選ぶのが確実
                # (例: 85.0なら U+6C34 を優先的に拾う)
                if r_num not in radical_to_unified or (int(u_code[2:], 16) < int(radical_to_unified[r_num][2:], 16)):
                    radical_to_unified[r_num] = u_code

    # 4. 214部首分すべてを結合
    master_list = []
    for i in range(1, 215):
        r_str = str(i)
        u_code = radical_to_unified.get(r_str, "N/A")
        
        # 変形部首の取得
        cjk_codes = equiv_map.get(u_code, [])
        cjk_chars = "".join([chr(int(c[2:], 16)) for c in cjk_codes])
        cjk_codes_str = ",".join(cjk_codes) if cjk_codes else "N/A"
        
        u_char = chr(int(u_code[2:], 16)) if u_code != "N/A" else "N/A"

        master_list.append({
            '康熙部首番号': r_str,
            '康熙部首文字': kangxi_map[r_str]['文字'],
            '康熙部首コード': kangxi_map[r_str]['コード'],
            '仲介常用漢字': u_char,
            '常用漢字コード': u_code,
            'CJK部首補助': cjk_chars,
            'CJK部首補助コード': cjk_codes_str
        })

    # 5. CSV書き出し
    headers = ['康熙部首番号', '康熙部首文字', '康熙部首コード', '仲介常用漢字', '常用漢字コード', 'CJK部首補助', 'CJK部首補助コード']
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_list)

    print(f"214部首の処理が完了しました。出力: {OUTPUT_FILE}")

if __name__ == "__main__":
    create_radical_master()

