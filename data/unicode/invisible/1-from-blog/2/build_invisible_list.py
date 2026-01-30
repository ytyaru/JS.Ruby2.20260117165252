#!/usr/bin/env python3
import requests
import re

def extract_unicode_from_url(url):
    print(f"取得中: {url}")
    try:
        # ブラウザからのアクセスを装う
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = response.apparent_encoding
        
        # HTMLソース全体から U+XXXX 形式を抽出
        found_codes = re.findall(r'[uU]\+([0-9a-fA-F]{4,6})', response.text)
        
        unique_codes = {int(c, 16) for c in found_codes}
        print(f"発見数: {len(unique_codes)} 文字 ({url})")
        return unique_codes
    except Exception as e:
        print(f"エラー発生 ({url}): {e}")
        return set()

def save_tsv(filename, code_set):
    # 16進数値のみを昇順で保存
    with open(filename, 'w', encoding='utf-8') as f:
        for code in sorted(list(code_set)):
            f.write(f"0x{code:04X}\n")

def format_js_array(code_set):
    sorted_codes = sorted(list(code_set))
    if not sorted_codes: return "[]"
    
    ranges = []
    start = sorted_codes[0]
    end = sorted_codes[0]
    
    for i in range(1, len(sorted_codes)):
        if sorted_codes[i] == end + 1:
            end = sorted_codes[i]
        else:
            ranges.append(f"0x{start:04X}" if start == end else f"[0x{start:04X}, 0x{end:04X}]")
            start = end = sorted_codes[i]
    ranges.append(f"0x{start:04X}" if start == end else f"[0x{start:04X}, 0x{end:04X}]")
    
    return "[" + ", ".join(ranges) + "]"

if __name__ == "__main__":
    # 対象URL
    url1 = "https://tech-blog.s-yoshiki.com/entry/303"
    url2 = "https://gigazine.net/gsc_news/en/20221208-invisible-characters/"
    
    set1 = extract_unicode_from_url(url1)
    set2 = extract_unicode_from_url(url2)
    
    # 1.tsv, 2.tsv の作成
    save_tsv("1.tsv", set1)
    save_tsv("2.tsv", set2)
    
    # 重複排除マージと 3.tsv の作成
    merged = set1.union(set2)
    save_tsv("3.tsv", merged)
    
    # JSファイルの生成
    js_array_str = format_js_array(merged)
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const heuristicInvisibleChars = new CharGroup({js_array_str}, '
        f'{{ja:\'人力抽出した不可視文字\', en:\'HeuristicInvisibleChars\'}});\n'
    )
    
    with open("heuristic-invisible-chars.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"\n完了: 1.tsv, 2.tsv, 3.tsv, および heuristic-invisible-chars.js を作成しました。")
    print(f"合計ユニーク文字数: {len(merged)}")

