#!/usr/bin/env python3
def export_to_js_file(input_txt="invisible-chars.txt", output_js="invisible-chars.js"):
    code_points = []
    with open(input_txt, "r", encoding="utf-8") as f:
        for line in f:
            # 16進数部分のみ取得（タブ区切りがある場合を考慮）
            cp_hex = line.split('\t')[0].strip()
            if cp_hex:
                code_points.append(int(cp_hex, 16))
    
    code_points.sort()
    
    ranges = []
    if not code_points:
        return

    start = code_points[0]
    end = code_points[0]

    for i in range(1, len(code_points)):
        if code_points[i] == end + 1:
            end = code_points[i]
        else:
            ranges.append([start, end] if start != end else start)
            start = end = code_points[i]
    ranges.append([start, end] if start != end else start)

    # JS配列形式の文字列構築
    js_elements = []
    for r in ranges:
        if isinstance(r, list):
            js_elements.append(f"[0x{r[0]:04X}, 0x{r[1]:04X}]")
        else:
            js_elements.append(f"0x{r:04X}")
    
    array_content = ",\n    ".join(js_elements)
    
    # ファイル書き出し
    with open(output_js, "w", encoding="utf-8") as f:
        f.write('import { CharGroupLarge } from "./char-group-large.js";\n\n')
        f.write('export const InvisibleCharsLarge = new CharGroupLarge([\n    ')
        f.write(array_content)
        f.write('\n], { ja: "不可視文字", en: "InvisibleChars" });\n')

    print(f"JavaScriptファイルを出力しました: {output_js} (要素数: {len(ranges)})")


export_to_js_file()
