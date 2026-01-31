#!/usr/bin/env python3
import os
import sys
import unicodedata

# プロジェクトルート（unicode/invisible/）を検索パスに追加
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# 外部ヘルプのインポート
try:
    from help.categorize_tsv import HELP_DESCRIPTION, HELP_EPILOG
except ImportError:
    HELP_DESCRIPTION = "由来別分類実行"
    HELP_EPILOG = "help/categorize_tsv.py が見つかりません。"

def get_unicode_category(code):
    """Unicode標準からカテゴリを取得"""
    return unicodedata.category(chr(code))

def load_unicode_tsv(filename):
    data = {}
    if not os.path.exists(filename):
        print(f"エラー: 必須ファイル {filename} が見つかりません。")
        sys.exit(1)
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            if len(parts) >= 2:
                try: data[int(parts[0], 16)] = parts[1]
                except ValueError: continue
    return data

def load_heuristic_tsv(filename):
    codes = set()
    if not os.path.exists(filename):
        print(f"エラー: 必須ファイル {filename} が見つかりません。")
        sys.exit(1)
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try:
                code = int(line, 16) if line.lower().startswith("0x") else int(line, 16)
                codes.add(code)
            except ValueError: continue
    return codes

def save_split(filename, codes, u_dict):
    # 出力先ディレクトリの自動作成
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        for c in sorted(list(codes)):
            cate = u_dict.get(c) or get_unicode_category(c)
            f.write(f"{c:04X}\t{cate}\n")

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description=HELP_DESCRIPTION,
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=HELP_EPILOG
    )
    parser.parse_args()

    # パス定義
    src_db = os.path.join(project_root, "src", "db")
    dist_db_cat = os.path.join(project_root, "dist", "db", "categorize")

    # 読み込み
    u_dict = load_unicode_tsv(os.path.join(src_db, "unicode.tsv"))
    h_set = load_heuristic_tsv(os.path.join(src_db, "heuristic.tsv"))
    
    u_set = set(u_dict.keys())
    only_u = u_set - h_set
    only_h = h_set - u_set
    both = u_set & h_set

    # 保存
    save_split(os.path.join(dist_db_cat, "only-unicode.tsv"), only_u, u_dict)
    save_split(os.path.join(dist_db_cat, "only-heuristic.tsv"), only_h, u_dict)
    save_split(os.path.join(dist_db_cat, "both.tsv"), both, u_dict)

    print(f"分類完了: {dist_db_cat} 配下にファイルを生成しました。")

if __name__ == "__main__":
    main()

