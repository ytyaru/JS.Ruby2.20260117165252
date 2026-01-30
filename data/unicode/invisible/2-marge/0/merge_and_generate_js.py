#!/usr/bin/env python3
import os

def load_unicode_tsv(filename):
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: {filename} が見つかりません。")
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split('\t')
            if parts and parts[0]:
                try:
                    codes.add(int(parts[0], 16))
                except ValueError:
                    continue
    return codes

def load_heuristic_tsv(filename):
    codes = set()
    if not os.path.exists(filename):
        print(f"警告: {filename} が見つかりません。")
        return codes
    with open(filename, "r", encoding="utf-8") as f:
        for line in f:
            val = line.strip()
            if val.startswith("0x"):
                try:
                    codes.add(int(val, 16))
                except ValueError:
                    continue
    return codes

def format_js_array_multiline(code_set):
    """
    要素ごとに改行とインデントを加え、見やすいJS配列文字列を作成する
    """
    sorted_codes = sorted(list(code_set))
    if not sorted_codes:
        return "[]"
    
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
    
    # 整形
    lines = []
    for s, e in ranges_raw:
        if s == e:
            lines.append(f"  0x{s:04X}")
        else:
            lines.append(f"  [0x{s:04X}, 0x{e:04X}]")
            
    return "[\n" + ",\n".join(lines) + "\n]"

def main():
    unicode_set = load_unicode_tsv("unicode.tsv")
    heuristic_set = load_heuristic_tsv("heuristic.tsv")
    
    merged_set = unicode_set.union(heuristic_set)
    
    # merge.tsv の出力 (0000 形式)
    with open("merge.tsv", "w", encoding="utf-8") as f:
        for code in sorted(list(merged_set)):
            f.write(f"{code:04X}\n")
    
    # invisible-chars.js の生成 (改行・インデントあり)
    js_array_str = format_js_array_multiline(merged_set)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'マージされた不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    
    with open("invisible-chars.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"完了:")
    print(f" - unicode.tsv: {len(unicode_set)} 件")
    print(f" - heuristic.tsv: {len(heuristic_set)} 件")
    print(f" - merge.tsv: {len(merged_set)} 件 (重複排除後)")
    print(f" - invisible-chars.js (整形済み) を生成しました")

if __name__ == "__main__":
    main()

