#!/usr/bin/env python3
import os
import sys
import argparse

# プロジェクトルートを検索パスに追加
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# 外部ヘルプのインポート
try:
    from help.generate_js import HELP_DESCRIPTION, HELP_EPILOG
except ImportError:
    HELP_DESCRIPTION = "JavaScriptコード生成実行"
    HELP_EPILOG = "help/generate_js.py が見つかりません。"

def format_js_array_multiline(code_set):
    """
    数値をソートし、連続するコードをレンジ形式 [start, end] にまとめた
    インデント付きの JS 配列文字列を生成する。
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
        description=HELP_DESCRIPTION,
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=HELP_EPILOG
    )
    # 入力ファイルを引数で受け取れるようにしつつ、デフォルトを merge.tsv に設定
    default_input = os.path.join(project_root, "dist", "db", "merge.tsv")
    parser.add_argument('input', nargs='?', default=default_input, help='入力TSVファイル (デフォルト: dist/db/merge.tsv)')
    
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"エラー: 入力ファイル {args.input} が見つかりません。")
        sys.exit(1)

    # データの読み込み (1列目のコードポイントのみを使用)
    codes = set()
    with open(args.input, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            parts = line.split('\t')
            try:
                # 16進数文字列を数値に変換
                codes.add(int(parts[0], 16))
            except (ValueError, IndexError):
                continue

    # JS出力内容の構成
    js_array_str = format_js_array_multiline(codes)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const invisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'統合不可視文字\', en:\'InvisibleChars\'}});\n'
    )
    
    # 出力先を dist/ 直下に固定
    output_file = os.path.join(project_root, "dist", "invisible-chars.js")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"成功: {len(codes)} 件のコードから {output_file} を生成しました。")

if __name__ == "__main__":
    main()

