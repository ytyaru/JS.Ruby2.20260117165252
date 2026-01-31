#!/usr/bin/env python3
import os
import argparse
import sys
# 外部ヘルプファイルをインポート
try:
    from help_config import HELP_DESCRIPTION, HELP_EPILOG
except ImportError:
    HELP_DESCRIPTION = "マージ処理"
    HELP_EPILOG = "help_config.py が見つかりません。"

def load_intermediate_tsv(filename):
    data = {}
    if not os.path.exists(filename): return data
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                try: data[int(parts[0], 16)] = parts[1]
                except ValueError: continue
    return data

def load_external_list(filename):
    codes = set()
    if not os.path.exists(filename): return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                code = int(line, 16) if line.lower().startswith("0x") else int(line, 16)
                codes.add(code)
            except ValueError: continue
    return codes

def match_category(target_cate, query_list):
    if not target_cate: return False
    for q in query_list:
        if target_cate == q or (len(q) == 1 and target_cate.startswith(q)):
            return True
    return False

def main():
    parser = argparse.ArgumentParser(
        description=HELP_DESCRIPTION,
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=HELP_EPILOG
    )
    parser.add_argument('--cate-white', help='含めるカテゴリ/由来を指定 (カンマ区切り)')
    parser.add_argument('--cate-black', help='除外するカテゴリ/由来を指定 (カンマ区切り)')
    parser.add_argument('--add-list', help='追加する外部ファイル (カンマ区切り)')
    parser.add_argument('--ban-list', help='除外する外部ファイル (カンマ区切り)')
    parser.add_argument('--off-cate', action='store_true', help='merge.tsvに情報を出力しない')
    
    args = parser.parse_args()

    sources = {
        "unicode": load_intermediate_tsv("only-unicode.tsv"),
        "heuristic": load_intermediate_tsv("only-heuristic.tsv"),
        "both": load_intermediate_tsv("both.tsv")
    }

    all_codes = set()
    for codes in sources.values(): all_codes.update(codes.keys())

    def is_match(code, query_list):
        origin = next((l for l, d in sources.items() if code in d), "external")
        cate = sources.get(origin, {}).get(code, "Unknown")
        for q in query_list:
            if q in ["unicode", "heuristic", "both"]:
                if origin == q: return True
            elif match_category(cate, [q]):
                return True
        return False

    final_set = all_codes
    if args.cate_white:
        q_list = [q.strip() for q in args.cate_white.split(',')]
        final_set = {c for c in final_set if is_match(c, q_list)}
    elif args.cate_black:
        q_list = [q.strip() for q in args.cate_black.split(',')]
        final_set = {c for c in final_set if not is_match(c, q_list)}

    if args.add_list:
        for f in args.add_list.split(','): final_set |= load_external_list(f.strip())
    if args.ban_list:
        for f in args.ban_list.split(','): final_set -= load_external_list(f.strip())

    with open("merge.tsv", "w", encoding="utf-8") as f:
        for c in sorted(list(final_set)):
            if args.off_cate: f.write(f"{c:04X}\n")
            else:
                origin = next((l for l, d in sources.items() if c in d), "external")
                cate = sources.get(origin, {}).get(c, "Unknown")
                f.write(f"{c:04X}\t{cate}\t{origin}\n")

    print(f"マージ完了: merge.tsv ({len(final_set)}件)")

if __name__ == "__main__":
    main()

