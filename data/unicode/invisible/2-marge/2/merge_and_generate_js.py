#!/usr/bin/env python3
import os
import argparse
import sys

def load_tsv_with_category(filename):
    """
    unicode.tsv (Code\tCategory) を読み込む。辞書形式で返す {code: category}
    """
    data = {}
    if not os.path.exists(filename):
        return data
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                try:
                    data[int(parts[0], 16)] = parts[1]
                except ValueError: continue
    return data

def load_simple_tsv(filename):
    """
    heuristic.tsv や add/banリスト (0xXXXX または XXXX) を読み込む
    """
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: ファイルが見つかりません: {filename}")
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            val = line.strip().split('\t')[0] # 2列目以降は無視
            if not val: continue
            try:
                code = int(val, 16) if val.startswith("0x") else int(val, 16)
                codes.add(code)
            except ValueError: continue
    return codes

def format_js_array_multiline(code_set):
    sorted_codes = sorted(list(code_set))
    if not sorted_codes: return "[]"
    ranges_raw = []
    if not sorted_codes: return "[]"
    start = end = sorted_codes[0]
    for i in range(1, len(sorted_codes)):
        if sorted_codes[i] == end + 1:
            end = sorted_codes[i]
        else:
            ranges_raw.append((start, end))
            start = end = sorted_codes[i]
    ranges_raw.append((start, end))
    lines = [f"  0x{s:04X}" if s == e else f"  [0x{s:04X}, 0x{e:04X}]" for s, e in ranges_raw]
    return "[\n" + ",\n".join(lines) + "\n]"

def main():
    parser = argparse.ArgumentParser(description='不可視文字リスト管理ツール')
    parser.add_argument('--cate-white', help='含めるカテゴリ (例: Cc,Cf)')
    parser.add_argument('--cate-black', help='除外するカテゴリ (例: Mn,Z)')
    parser.add_argument('--add-list', help='追加マージするファイル (カンマ区切り)')
    parser.add_argument('--ban-list', help='削除(BAN)するファイル (カンマ区切り)')
    args = parser.parse_args()

    if args.cate_white and args.cate_black:
        print("エラー: --cate-white と --cate-black は同時に指定できません。")
        sys.exit(1)

    # 1. 基本データの読み込み
    u_dict = load_tsv_with_category("unicode.tsv")
    h_set = load_simple_tsv("heuristic.tsv")
    u_set = set(u_dict.keys())

    # 2. 差分ファイルの出力 (フィルタリング前に行う)
    with open("only-unicode.tsv", "w") as f:
        for c in sorted(list(u_set - h_set)): f.write(f"{c:04X}\n")
    with open("only-heuristic.tsv", "w") as f:
        for c in sorted(list(h_set - u_set)): f.write(f"{c:04X}\n")

    # 3. フィルタリング処理
    base_set = u_set | h_set
    
    if args.cate_white:
        whites = set(args.cate_white.split(','))
        base_set = {c for c in base_set if u_dict.get(c) in whites or c in h_set}
    elif args.cate_black:
        blacks = set(args.cate_black.split(','))
        base_set = {c for c in base_set if u_dict.get(c) not in blacks}

    # 4. ファイル指定による追加・削除
    if args.add_list:
        for f in args.add_list.split(','):
            base_set |= load_simple_tsv(f.strip())
    if args.ban_list:
        for f in args.ban_list.split(','):
            base_set -= load_simple_tsv(f.strip())

    # 5. 出力
    with open("merge.tsv", "w") as f:
        for c in sorted(list(base_set)): f.write(f"{c:04X}\n")

    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({format_js_array_multiline(base_set)}, '
        f'{{ja:\'マージされた不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    with open("invisible-chars.js", "w") as f: f.write(js_content)

    print(f"完了: merge.tsv ({len(base_set)}件), JSファイルを生成しました。")
    print(f"差分抽出: only-unicode.tsv, only-heuristic.tsv を更新しました。")

if __name__ == "__main__":
    main()

