#!/usr/bin/env python3
import urllib.request
import os

#UCD_URL = "https://www.unicode.org"
UCD_URL = "https://www.unicode.org/Public/UCD/latest/ucd/"
FILES = ["UnicodeData.txt", "PropList.txt"]
OUTPUT_FILE = "invisible-chars.txt"

def download_ucd():
    # User-Agentを設定して403エラーを回避
    opener = urllib.request.build_opener()
    opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
    urllib.request.install_opener(opener)

    for filename in FILES:
        if not os.path.exists(filename):
            print(f"Downloading {filename}...")
            try:
                urllib.request.urlretrieve(UCD_URL + filename, filename)
            except Exception as e:
                print(f"Error downloading {filename}: {e}")
                exit(1)

def parse_proplist():
    ignorable = set()
    white_space = set()
    if not os.path.exists("PropList.txt"): return ignorable, white_space
    
    with open("PropList.txt", "r", encoding="utf-8") as f:
        for line in f:
            if ";" not in line or line.startswith("#"): continue
            # セミコロンより前がコード範囲、後がプロパティ名
            data_part, comment_part = line.split("#") if "#" in line else (line, "")
            parts = data_part.split(";")
            code_range = parts[0].strip()
            prop = parts[1].strip()
            
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

    if not os.path.exists("UnicodeData.txt"): return

    with open("UnicodeData.txt", "r", encoding="utf-8") as f:
        for line in f:
            parts = line.split(";")
            if len(parts) < 3: continue
            cp = int(parts[0], 16)
            cat = parts[2]
            
            if cat in target_categories or cp in ignorable_set or cp in whitespace_set:
                invisible_code_points.add(cp)

    # PropList由来の文字をマージ（UnicodeDataに記載のないCnなどを含むため）
    invisible_code_points.update(ignorable_set)
    invisible_code_points.update(whitespace_set)

    # 16進数大文字、改行区切り、昇順で書き出し
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for cp in sorted(invisible_code_points):
            f.write(f"{cp:04X}\n")
    
    print(f"成功: {len(invisible_code_points)} 文字を {OUTPUT_FILE} に抽出しました。")

if __name__ == "__main__":
    main()

