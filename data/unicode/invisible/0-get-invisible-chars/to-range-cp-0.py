#!/usr/bin/env python3
def generate_js_source():
    code_points = []
    with open("invisible-chars.txt", "r") as f:
        for line in f:
            cp_str = line.split('\t')[0]
            code_points.append(int(cp_str, 16))
    
    code_points.sort()
    
    ranges = []
    if not code_points:
        return "[]"

    start = code_points[0]
    end = code_points[0]

    for i in range(1, len(code_points)):
        if code_points[i] == end + 1:
            end = code_points[i]
        else:
            # 範囲が1つの場合は数値のみ、複数の場合は[start, end]
            ranges.append([start, end] if start != end else start)
            start = end = code_points[i]
    ranges.append([start, end] if start != end else start)

    # JavaScript形式の文字列に変換
    js_elements = []
    for r in ranges:
        if isinstance(r, list):
            js_elements.append(f"[0x{r[0]:04X}, 0x{r[1]:04X}]")
        else:
            js_elements.append(f"0x{r:04X}")
    
    print("[" + ", ".join(js_elements) + "]")

generate_js_source()

