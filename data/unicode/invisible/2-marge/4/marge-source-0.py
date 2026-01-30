#!/usr/bin/env python3
import os
import argparse
import sys

def load_intermediate_tsv(filename):
    """
    Code\tCategory 形式の中間ファイルを読み込む
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
                except ValueError:
                    continue
    return data

def load_external_list(filename):
    """
    --add-list や --ban-list で指定された外部ファイルを読み込む
    """
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: 外部ファイル {filename} が見つかりません。")
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                # 0xXXXX または XXXX 形式に対応
                code = int(line, 16) if line.lower().startswith("0x") else int(line, 16)
                codes.add(code)
            except ValueError:
                continue
    return codes

def match_category(target_cate, query_list):
    """
    カテゴリが大分類(1文字)または小分類(2文字)に合致するか判定
    """
    if not target_cate: return False
    for q in query_list:
        if target_cate == q: return True
        if len(q) == 1 and target_cate.startswith(q):
            return True
    return False

def main():
    parser = argparse.ArgumentParser(description='中間ファイルをマージしてフィルタリングを行う。')
    parser.add_argument('--cate-white', help='含めるカテゴリ/由来を指定 (カンマ区切り)')
    parser.add_argument('--cate-black', help='除外するカテゴリ/由来を指定 (カンマ区切り)')
    parser.add_argument('--add-list', help='追加マージする外部ファイル (カンマ区切り)')
    parser.add_argument('--ban-list', help='除外する外部ファイル (カンマ区切り)')
    parser.add_argument('--off-cate', action='store_true', help='merge.tsvに情報を出力しない')
    
    args = parser.parse_args()

    # 1. 中間データの読み込み（由来をラベルとして保持）
    sources = {
        "unicode": load_intermediate_tsv("only-unicode.tsv"),
        "heuristic": load_intermediate_tsv("only-heuristic.tsv"),
        "both": load_intermediate_tsv("both.tsv")
    }

    # 全候補コードの統合
    all_codes = set()
    for codes in sources.values():
        all_codes.update(codes.keys())

    def is_match(code, query_list):
        # 由来の判定
        origin = None
        for label, data in sources.items():
            if code in data:
                origin = label
                break
        
        # カテゴリの判定
        cate = sources[origin][code]
        
        for q in query_list:
            if q in ["unicode", "heuristic", "both"]:
                if origin == q: return True
            elif match_category(cate, [q]):
                return True
        return False

    # 2. フィルタリング
    final_set = all_codes
    if args.cate_white:
        q_list = [q.strip() for q in args.cate_white.split(',')]
        final_set = {c for c in final_set if is_match(c, q_list)}
    elif args.cate_black:
        q_list = [q.strip() for q in args.cate_black.split(',')]
        final_set = {c for c in final_set if not is_match(c, q_list)}

    # 3. 外部リストによる追加・削除
    if args.add_list:
        for f in args.add_list.split(','):
            final_set |= load_external_list(f.strip())
    if args.ban_list:
        for f in args.ban_list.split(','):
            final_set -= load_external_list(f.strip())

    # 4. merge.tsv の出力
    with open("merge.tsv", "w", encoding="utf-8") as f:
        for c in sorted(list(final_set)):
            if args.off_cate:
                f.write(f"{c:04X}\n")
            else:
                # 由来とカテゴリを特定して出力
                origin = "unknown"
                cate = "unknown"
                for label, data in sources.items():
                    if c in data:
                        origin = label
                        cate = data[c]
                        break
                f.write(f"{c:04X}\t{cate}\t{origin}\n")

    print(f"マージ完了: merge.tsv ({len(final_set)}件)")

if __name__ == "__main__":
    main()

