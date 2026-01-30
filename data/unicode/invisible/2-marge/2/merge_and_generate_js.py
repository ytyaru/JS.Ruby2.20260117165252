#!/usr/bin/env python3
import os
import argparse
import sys

def load_tsv_with_category(filename):
    data = {}
    if not os.path.exists(filename):
        return data
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                try:
                    # キーは整数、値はカテゴリ名
                    data[int(parts[0], 16)] = parts[1]
                except ValueError: continue
    return data

def load_simple_tsv(filename):
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: ファイルが見つかりません: {filename}")
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            val = line.strip()
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
    parser = argparse.ArgumentParser(
        description='不可視文字一覧(merge.tsv)とJavaScript用コード(invisible-chars.js)を生成する。',
        formatter_class=argparse.RawTextHelpFormatter,
        epilog="""
入出力ファイル:
  unicode.tsv    [入力] Unicodeカテゴリから抽出した基本リスト (書式: Code\\tCategory)
  heuristic.tsv  [入力] ブログやPDF視認で抽出した補完リスト (書式: 0xXXXX)
  merge.tsv      [出力] 全ての条件を適用した最終的な統合リスト (書式: XXXX)
  invisible-chars.js [出力] JavaScriptから利用するためのCharGroup定義ファイル
  only-unicode.tsv   [出力] 分析用：unicode.tsvにのみ存在する文字
  only-heuristic.tsv [出力] 分析用：heuristic.tsvにのみ存在する文字
        """
    )
    parser.add_argument('--cate-white', help='含めるカテゴリを指定 (カンマ区切り)。\n"heuristic" を含めると人力抽出分を維持、無ければ除外。')
    parser.add_argument('--cate-black', help='除外するカテゴリを指定 (カンマ区切り)。\n"heuristic" を含めると人力抽出分を強制除外。')
    parser.add_argument('--add-list', help='追加マージするファイル (カンマ区切り)')
    parser.add_argument('--ban-list', help='削除(BAN)するファイル (カンマ区切り)')
    
    args = parser.parse_args()

    if args.cate_white and args.cate_black:
        print("エラー: --cate-white と --cate-black は同時に指定できません。")
        sys.exit(1)

    # 1. データの読み込み
    u_dict = load_tsv_with_category("unicode.tsv")
    h_set = load_simple_tsv("heuristic.tsv")
    u_set = set(u_dict.keys())

    # 2. 差分分析 (フィルタリング前の純粋な比較)
    with open("only-unicode.tsv", "w") as f:
        for c in sorted(list(u_set - h_set)): f.write(f"{c:04X}\n")
    with open("only-heuristic.tsv", "w") as f:
        for c in sorted(list(h_set - u_set)): f.write(f"{c:04X}\n")

    # 3. フィルタリングロジック
    final_set = u_set | h_set
    
    if args.cate_white:
        whites = set(args.cate_white.split(','))
        new_set = set()
        for c in final_set:
            is_h = (c in h_set)
            cate = u_dict.get(c)
            # カテゴリが一致、または (heuristicが許可されていてかつ該当文字がheuristicにある)
            if cate in whites or ("heuristic" in whites and is_h):
                new_set.add(c)
        final_set = new_set
        
    elif args.cate_black:
        blacks = set(args.cate_black.split(','))
        new_set = set()
        for c in final_set:
            is_h = (c in h_set)
            cate = u_dict.get(c)
            # カテゴリがブラックリストにある、または (heuristicが拒否されていてかつ該当文字がheuristicにある)
            if cate in blacks or ("heuristic" in blacks and is_h):
                continue
            new_set.add(c)
        final_set = new_set

    # 4. 追加・禁止リストの適用
    if args.add_list:
        for f_path in args.add_list.split(','):
            final_set |= load_simple_tsv(f_path.strip())
    if args.ban_list:
        for f_path in args.ban_list.split(','):
            final_set -= load_simple_tsv(f_path.strip())

    # 5. ファイル出力
    with open("merge.tsv", "w") as f:
        for c in sorted(list(final_set)): f.write(f"{c:04X}\n")

    js_array_str = format_js_array_multiline(final_set)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'マージされた不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    with open("invisible-chars.js", "w") as f: f.write(js_content)

    print(f"処理完了: merge.tsv ({len(final_set)}件) を生成しました。")

if __name__ == "__main__":
    main()

