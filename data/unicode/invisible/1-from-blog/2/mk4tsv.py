#!/usr/bin/env python3

def main():
    # 1. 既存の3.tsvを読み込む
    try:
        with open("3.tsv", "r", encoding="utf-8") as f:
            # 0xXXXX 形式の行から数値セットを作成
            current_codes = {int(line.strip(), 16) for line in f if line.strip().startswith("0x")}
    except FileNotFoundError:
        print("エラー: 3.tsv が見つかりません。")
        return

    # 2. 削除要素 (3-1.txt相当): PDFで実線図形があったもの
    to_remove = {0x2800}
    
    # 3. 追加要素 (3+1.txt相当): PDFで点線枠を確認した漏れ分
    to_add = {
        0x2011, 0x2028, 0x2029, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E,
        0x2066, 0x2067, 0x2068, 0x2069,
        0x180B, 0x180C, 0x180D, 0x180F
    }

    # 4. 集合演算で更新
    final_set = (current_codes - to_remove) | to_add

    # 5. 4.tsv (最終結果) の出力
    with open("4.tsv", "w", encoding="utf-8") as f:
        for code in sorted(list(final_set)):
            f.write(f"0x{code:04X}\n")

    # 6. JSソースの生成 (heuristic-invisible-chars.js)
    js_array_str = format_js_array(final_set)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const heuristicInvisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'人力抽出した不可視文字\', en:\'HeuristicInvisibleChars\'}});\n'
    )
    
    with open("heuristic-invisible-chars.js", "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"完了: 4.tsv を作成しました (合計 {len(final_set)} 文字)")
    print(f"除外: {[hex(c) for c in to_remove]}")
    print(f"追加: {len(to_add)} 文字を補完しました")

def format_js_array(code_set):
    sorted_codes = sorted(list(code_set))
    if not sorted_codes: return "[]"
    ranges, start, end = [], sorted_codes[0], sorted_codes[0]
    for i in range(1, len(sorted_codes)):
        if sorted_codes[i] == end + 1:
            end = sorted_codes[i]
        else:
            ranges.append(f"0x{start:04X}" if start == end else f"[0x{start:04X}, 0x{end:04X}]")
            start = end = sorted_codes[i]
    ranges.append(f"0x{start:04X}" if start == end else f"[0x{start:04X}, 0x{end:04X}]")
    return "[" + ", ".join(ranges) + "]"

if __name__ == "__main__":
    main()

