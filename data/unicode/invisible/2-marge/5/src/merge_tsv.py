#!/usr/bin/env python3
import os
import sys
import argparse

# プロジェクトルートと parts ディレクトリを検索パスに追加
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# 外部ヘルプおよびカテゴリ付与モジュールのインポート
try:
    from help.merge_tsv import HELP_DESCRIPTION, HELP_EPILOG
except ImportError:
    HELP_DESCRIPTION = "マージ・フィルタリング実行"
    HELP_EPILOG = "help/merge_tsv.py が見つかりません。"

try:
    from src.parts.add_category_to_tsv import get_category_for_code
except ImportError:
    def get_category_for_code(code): return "Unknown"

def load_intermediate_tsv(filename):
    if not os.path.exists(filename):
        print(f"エラー: 中間ファイル {filename} が見つかりません。")
        print("先に src/categorize_tsv.py を実行してください。")
        sys.exit(1)
    data = {}
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            if len(parts) >= 2:
                try: data[int(parts[0], 16)] = parts[1]
                except ValueError: continue
    return data

def load_external_list(filename):
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: 外部ファイル {filename} が見つかりません。")
        return codes
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

    cat_dir = os.path.join(project_root, "dist", "db", "categorize")
    merge_file = os.path.join(project_root, "dist", "db", "merge.tsv")

    sources = {
        "unicode": load_intermediate_tsv(os.path.join(cat_dir, "only-unicode.tsv")),
        "heuristic": load_intermediate_tsv(os.path.join(cat_dir, "only-heuristic.tsv")),
        "both": load_intermediate_tsv(os.path.join(cat_dir, "both.tsv"))
    }

    # 外部追加分を保持する辞書
    external_data = {}
    if args.add_list:
        for f in args.add_list.split(','):
            ext_codes = load_external_list(f.strip())
            for c in ext_codes:
                external_data[c] = get_category_for_code(c)

    all_codes = set(external_data.keys())
    for codes in sources.values(): all_codes.update(codes.keys())

    def get_info(code):
        for label, data in sources.items():
            if code in data: return label, data[code]
        if code in external_data: return "external", external_data[code]
        return "unknown", "Unknown"

    def is_match(code, query_list):
        origin, cate = get_info(code)
        for q in query_list:
            if q in ["unicode", "heuristic", "both", "external"]:
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

    if args.ban_list:
        for f in args.ban_list.split(','): final_set -= load_external_list(f.strip())

    os.makedirs(os.path.dirname(merge_file), exist_ok=True)
    with open(merge_file, "w", encoding="utf-8") as f:
        for c in sorted(list(final_set)):
            if args.off_cate: f.write(f"{c:04X}\n")
            else:
                origin, cate = get_info(c)
                f.write(f"{c:04X}\t{cate}\t{origin}\n")

    print(f"マージ完了: {merge_file} ({len(final_set)}件)")

if __name__ == "__main__":
    main()
