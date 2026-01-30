#!/usr/bin/env python3
import os
import unicodedata

def get_unicode_category(code):
    """Unicode標準から現在のカテゴリ(Cc, Zs等)を取得する"""
    return unicodedata.category(chr(code))

def load_unicode_tsv(filename):
    """unicode.tsv (Code\tCategory) を読み込む"""
    data = {}
    if not os.path.exists(filename):
        return data
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 2:
                try:
                    data[int(parts, 16)] = parts[1]
                except ValueError:
                    continue
    return data

def load_heuristic_tsv(filename):
    """heuristic.tsv (0xXXXX) を読み込む"""
    codes = set()
    if not os.path.exists(filename):
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            val = line.strip().split('\t')[0]
            if not val:
                continue
            try:
                code = int(val, 16) if val.lower().startswith("0x") else int(val, 16)
                codes.add(code)
            except ValueError:
                continue
    return codes

def save_split_clean(filename, codes, u_dict):
    """結果を (Code\tCategory) の形式で保存する。由来はファイル名で識別。"""
    with open(filename, "w", encoding="utf-8") as f:
        for c in sorted(list(codes)):
            # カテゴリ情報を付与
            cate = u_dict.get(c) or get_unicode_category(c)
            f.write(f"{c:04X}\t{cate}\n")

def main():
    u_dict = load_unicode_tsv("unicode.tsv")
    h_set = load_heuristic_tsv("heuristic.tsv")
    u_set = set(u_dict.keys())

    # 由来別に集合を作成
    only_u = u_set - h_set
    only_h = h_set - u_set
    both = u_set & h_set

    # 出力 (Origin列を廃止)
    save_split_clean("only-unicode.tsv", only_u, u_dict)
    save_split_clean("only-heuristic.tsv", only_h, u_dict)
    save_split_clean("both.tsv", both, u_dict)

    print("分類完了 (Code\\tCategory 形式):")
    print(f"  - only-unicode.tsv: {len(only_u)} 件")
    print(f"  - only-heuristic.tsv: {len(only_h)} 件")
    print(f"  - both.tsv: {len(both)} 件")

if __name__ == "__main__":
    main()

