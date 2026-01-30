#!/usr/bin/env python3

def format_js_array(code_set):
    """
    数値セットを [0x0000, [0x0001, 0x001F], ...] 形式の文字列に変換する
    """
    sorted_codes = sorted(list(code_set))
    if not sorted_codes:
        return "[]"
    
    ranges = []
    if len(sorted_codes) > 0:
        start = sorted_codes[0]
        end = sorted_codes[0]
        
        for i in range(1, len(sorted_codes)):
            if sorted_codes[i] == end + 1:
                end = sorted_codes[i]
            else:
                if start == end:
                    ranges.append(f"0x{start:04X}")
                else:
                    ranges.append(f"[0x{start:04X}, 0x{end:04X}]")
                start = end = sorted_codes[i]
        
        # 最後の要素を処理
        if start == end:
            ranges.append(f"0x{start:04X}")
        else:
            ranges.append(f"[0x{start:04X}, 0x{end:04X}]")
            
    return "[" + ", ".join(ranges) + "]"

def main():
    input_file = "4.tsv"
    output_file = "heuristic-invisible-chars.js"
    
    try:
        # 4.tsv からコードポイントを読み込む
        with open(input_file, "r", encoding="utf-8") as f:
            codes = {int(line.strip(), 16) for line in f if line.strip().startswith("0x")}
    except FileNotFoundError:
        print(f"エラー: {input_file} が見つかりません。")
        return
    except ValueError as e:
        print(f"エラー: ファイルの読み込み中に問題が発生しました: {e}")
        return

    # JS配列文字列の作成
    js_array_str = format_js_array(codes)
    
    # JSファイルの書き出し
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const heuristicInvisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'人力抽出した不可視文字\', en:\'HeuristicInvisibleChars\'}});\n'
    )
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"成功: {input_file} (全{len(codes)}件) に基づき {output_file} を更新しました。")

if __name__ == "__main__":
    main()

