#!/usr/bin/env python3
import os
import argparse
# 外部ヘルプファイルをインポート
try:
    from help_config_js import JS_HELP_DESCRIPTION, JS_HELP_EPILOG
except ImportError:
    JS_HELP_DESCRIPTION = "JS生成"
    JS_HELP_EPILOG = "help_config_js.py が見つかりません。"

def format_js_array_multiline(code_set):
    """
    数値を昇順ソートし、連続するコードをレンジ形式 [start, end] にまとめて、
    改行・インデント付きの JS 配列文字列を返す。
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
    
    lines = []
    for s, e in ranges_raw:
        if s == e:
            lines.append(f"  0x{s:04X}")
        else:
            lines.append(f"  [0x{s:04X}, 0x{e:04X}]")
            
    return "[\n" + ",\n".join(lines) + "\n]"

def main():
    parser = argparse.ArgumentParser(
        description=JS_HELP_DESCRIPTION,
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=JS_HELP_EPILOG
    )
    # デフォルトの入力先は merge.tsv とします
    parser.add_argument('input', nargs='?', default='merge.tsv', help='入力TSVファイル (デフォルト: merge.tsv)')
    
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: 入力ファイル {args.input} が見つかりません。")
        return

    # merge.tsv の読み込み (Code は最初の列)
    codes = set()
    with open(args.input, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            try:
                codes.add(int(parts[0], 16))
            except ValueError:
                continue

    # JS出力
    js_array_str = format_js_array_multiline(codes)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'マージされた不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    
    output_file = "invisible-chars.js"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"成功: {len(codes)} 件のコードに基づき {output_file} を生成しました。")

if __name__ == "__main__":
    main()

