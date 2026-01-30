#!/usr/bin/env python3
import urllib.request
import os

UCD_URL = "https://www.unicode.org/Public/UCD/latest/ucd/"
FILES = ["UnicodeData.txt", "PropList.txt"]
OUTPUT_FILE = "invisible-chars.txt"

def download_ucd():
    for filename in FILES:
        if not os.path.exists(filename):
            print(f"Downloading {filename}...")
            # プロキシ環境などでエラーが出る場合はここを確認
            urllib.request.urlretrieve(UCD_URL + filename, filename)

def parse_proplist():
    ignorable = set()
    white_space = set()
    with open("PropList.txt", "r", encoding="utf-8") as f:
        for line in f:
            if ";" not in line or line.startswith("#"): continue
            parts = line.split(";")
            code_range = parts[0].strip()
            prop = parts[1].split("#")[0].strip()
            
            r_parts = code_range.split("..")
            start = int(r_parts[0], 16)
            end = int(r_parts[1], 16) if len(r_parts) > 1 else start
            
            if prop == "Default_Ignorable_Code_Point":
                for cp in range(start, end + 1): ignorable.add(cp)
            elif prop == "White_Space":
                for cp in range(start, end + 1): white_space.add(cp)
    return ignorable, white_space

def main():
    download_ucd()
    ignorable_set, whitespace_set = parse_proplist()
    target_categories = {'Cc', 'Cf', 'Cs', 'Mn', 'Cn', 'Zl', 'Zp', 'Zs'}
    invisible_code_points = set()

    with open("UnicodeData.txt", "r", encoding="utf-8") as f:
        for line in f:
            parts = line.split(";")
            cp = int(parts[0], 16)
            cat = parts[2]
            if cat in target_categories or cp in ignorable_set or cp in whitespace_set:
                invisible_code_points.add(cp)

    invisible_code_points.update(ignorable_set)
    invisible_code_points.update(whitespace_set)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for cp in sorted(invisible_code_points):
            f.write(f"{cp:04X}\n")
    print(f"Done: {len(invisible_code_points)} chars to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

