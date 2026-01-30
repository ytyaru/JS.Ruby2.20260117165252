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
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            if len(parts) >= 2:
                try:
                    # parts[0]が16進数文字列、parts[1]がカテゴリ名
                    data[int(parts[0], 16)] = parts[1]
                except ValueError:
                    continue
    return data

def load_simple_tsv(filename):
    codes = set()
    if not os.path.exists(filename):
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            val = line.strip().split('\t')[0] # 1列目のみ取得
            if not val: continue
            try:
                # 0xの有無に対応
                code = int(val, 16) if val.lower().startswith("0x") else int(val, 16)
                codes.add(code)
            except ValueError:
                continue
    return codes

def format_js_array_multiline(code_set):
    sorted_codes = sorted(list(code_set))
    if not sorted_codes: return "[]"
    ranges_raw = []
    start = sorted_codes[0]
    end = sorted_codes[0]
    for i in range(1, len(sorted_codes)):
        if sorted_codes[i] == end + 1:
            end = sorted_codes[i]
        else:
            ranges_raw.append((start, end))
            start = end = sorted_codes[i]
    ranges_raw.append((start, end))
    lines = [f"  0x{s:04X}" if s == e else f"  [0x{s:04X}, 0x{e:04X}]" for s, e in ranges_raw]
    return "[\n" + ",\n".join(lines) + "\n]"

def match_category(target_cate, query_list):
    if not target_cate: return False
    for q in query_list:
        if target_cate == q: return True
        # 大分類(1文字)指定の場合、その文字で始まる小分類(Cc等)にマッチ
        if len(q) == 1 and target_cate.startswith(q):
            return True
    return False

def main():
    parser = argparse.ArgumentParser(
        description='不可視文字一覧(merge.tsv)とJavaScript用コード(invisible-chars.js)を生成する。',
        formatter_class=argparse.RawTextHelpFormatter,
        epilog="""
入出力ファイル:
  unicode.tsv    [入力] Unicodeカテゴリリスト (書式: Code\\tCategory)
  heuristic.tsv  [入力] 人力抽出リスト (書式: 0xXXXX)
  merge.tsv      [出力] 統合リスト。デフォルトで2列目にカテゴリを出力
  invisible-chars.js [出力] JavaScript用CharGroup定義ファイル

カテゴリ一覧:
  【特別項目】
  heuristic : 人力抽出リスト(heuristic.tsv)に存在する文字

  【C: その他 (Other)】
  Cc : 制御文字 (Control)
  Cf : 書式設定文字 (Format)
  Cs : サロゲートペア文字 (Surrogate)
  Co : 私用文字 (Private Use)
  Cn : 未定義文字 (Unassigned)

  【Z: セパレータ (Separator)】
  Zs : 空白文字 (Space)
  Zl : 行区切り文字 (Line)
  Zp : 段落区切り文字 (Paragraph)

  【M: 記号 (Mark)】
  Mn : 非前進結合記号 (Nonspacing)
  Mc : 前進結合記号 (Spacing Combining)
  Me : 囲み記号 (Enclosing)

  【S: シンボル (Symbol)】
  Sm : 数学記号 (Math)
  Sc : 通貨記号 (Currency)
  Sk : 修飾記号 (Modifier)
  So : その他記号 (Other)

  【P: 句読点 (Punctuation)】
  Pc : 連結句読点 (Connector)
  Pd : ダッシュ句読点 (Dash)
  Ps : 開始句読点 (Open)
  Pe : 終了句読点 (Close)
  Pi : 開始引用符 (Initial quote)
  Pf : 終了引用符 (Final quote)
  Po : その他句読点 (Other)

  【L: 文字 (Letter)】
  Lu : 大文字 (Uppercase)
  Ll : 小文字 (Lowercase)
  Lt : タイトルケース (Titlecase)
  Lm : 修飾文字 (Modifier)
  Lo : その他文字 (Other)

  【N: 数値 (Number)】
  Nd : 10進数字 (Decimal digit)
  Nl : 数字記号 (Letter)
  No : その他数字 (Other)
        """
    )
    parser.add_argument('--cate-white', help='含めるカテゴリを指定 (カンマ区切り)')
    parser.add_argument('--cate-black', help='除外するカテゴリを指定 (カンマ区切り)')
    parser.add_argument('--add-list', help='追加マージするファイル (カンマ区切り)')
    parser.add_argument('--ban-list', help='削除(BAN)するファイル (カンマ区切り)')
    parser.add_argument('--off-cate', action='store_true', help='merge.tsv の第2列を出力しない')
    
    args = parser.parse_args()

    if args.cate_white and args.cate_black:
        print("エラー: --cate-white と --cate-black は同時に指定できません。")
        sys.exit(1)

    # 1. データ読み込み
    u_dict = load_tsv_with_category("unicode.tsv")
    h_set = load_simple_tsv("heuristic.tsv")
    u_set = set(u_dict.keys())

    # 2. 差分分析
    with open("only-unicode.tsv", "w") as f:
        for c in sorted(list(u_set - h_set)): f.write(f"{c:04X}\n")
    with open("only-heuristic.tsv", "w") as f:
        for c in sorted(list(h_set - u_set)): f.write(f"{c:04X}\n")

    # 3. フィルタリング処理
    final_set = u_set | h_set
    
    if args.cate_white:
        whites = [c.strip() for c in args.cate_white.split(',')]
        new_set = set()
        for c in final_set:
            is_h = (c in h_set)
            cate = u_dict.get(c)
            if match_category(cate, whites) or ("heuristic" in whites and is_h):
                new_set.add(c)
        final_set = new_set
        
    elif args.cate_black:
        blacks = [c.strip() for c in args.cate_black.split(',')]
        new_set = set()
        for c in final_set:
            is_h = (c in h_set)
            cate = u_dict.get(c)
            if match_category(cate, blacks) or ("heuristic" in blacks and is_h):
                continue
            new_set.add(c)
        final_set = new_set

    # 4. ファイル指定による追加・削除
    if args.add_list:
        for f_path in args.add_list.split(','):
            final_set |= load_simple_tsv(f_path.strip())
    if args.ban_list:
        for f_path in args.ban_list.split(','):
            final_set -= load_simple_tsv(f_path.strip())

    # 5. merge.tsv の出力
    with open("merge.tsv", "w") as f:
        for c in sorted(list(final_set)):
            if args.off_cate:
                f.write(f"{c:04X}\n")
            else:
                cates = []
                if c in u_dict: cates.append(u_dict[c])
                if c in h_set: cates.append("heuristic")
                f.write(f"{c:04X}\t{','.join(cates)}\n")

    # 6. invisible-chars.js の生成
    js_array_str = format_js_array_multiline(final_set)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'マージされた不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    with open("invisible-chars.js", "w") as f:
        f.write(js_content)

    print(f"処理完了: merge.tsv ({len(final_set)}件) を生成しました。")

if __name__ == "__main__":
    main()

