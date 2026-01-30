#!/usr/bin/env python3
import urllib.request
import os

# 定数定義
#UCD_URL = "https://www.unicode.org"
UCD_URL = "https://www.unicode.org/Public/UCD/latest/ucd/"
FILES = ["UnicodeData.txt", "PropList.txt"]
OUTPUT_FILE = "invisible-chars.txt"

def download_ucd():
    for filename in FILES:
        if not os.path.exists(filename):
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(UCD_URL + filename, filename)

def parse_proplist():
    """PropList.txt から特定のプロパティを持つコードポイントを取得"""
    ignorable = set()
    white_space = set()
    
    with open("PropList.txt", "r", encoding="utf-8") as f:
        for line in f:
            if ";" not in line: continue
            code_range, prop = line.split(";")[:2]
            prop = prop.split("#")[0].strip()
            
            # 範囲指定(XXXX..YYYY)か単一(XXXX)かを判定
            parts = code_range.strip().split("..")
            start = int(parts[0], 16)
            end = int(parts[1], 16) if len(parts) > 1 else start
            
            target_set = None
            if prop == "Default_Ignorable_Code_Point": target_set = ignorable
            elif prop == "White_Space": target_set = white_space
            
            if target_set is not None:
                for cp in range(start, end + 1):
                    target_set.add(cp)
    return ignorable, white_space

def main():
    download_ucd()
    ignorable_set, whitespace_set = parse_proplist()
    
    target_categories = {'Cc', 'Cf', 'Cs', 'Mn', 'Cn', 'Zl', 'Zp', 'Zs'}
    invisible_code_points = set()

    # UnicodeData.txt のスキャン
    # ※UnicodeData.txtには全てのCn(未定義)は載っていないため、
    # プロパティ側から取得した値とカテゴリー判定を組み合わせます
    with open("UnicodeData.txt", "r", encoding="utf-8") as f:
        for line in f:
            parts = line.split(";")
            cp = int(parts[0], 16)
            cat = parts[2]
            
            if cat in target_categories or cp in ignorable_set or cp in whitespace_set:
                invisible_code_points.add(cp)

    # PropListに含まれるがUnicodeDataに詳細がないケース（Cnなど）を統合
    invisible_code_points.update(ignorable_set)
    invisible_code_points.update(whitespace_set)

    # コードポイント順にソートして出力
    sorted_cps = sorted(list(invisible_code_points))
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for cp in sorted_cps:
            f.write(f"{cp:04X}\n")

    print(f"完了: {len(sorted_cps)} 文字のコードポイントを {OUTPUT_FILE} に保存しました。")

if __name__ == "__main__":
    main()

