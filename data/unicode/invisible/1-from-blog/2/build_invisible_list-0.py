import requests
from bs4 import BeautifulSoup
import re
import os

def extract_unicode_from_url(url):
    print(f"Fetching: {url}")
    response = requests.get(url)
    response.encoding = response.apparent_encoding
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # U+XXXX または U+XXXXX 形式のコードを抽出
    text = soup.get_text()
    codes = re.findall(r'U\+([0-9A-Fa-f]{4,5})', text)
    
    # 整数に変換してセットで返す（重複排除）
    return {int(code, 16) for code in codes}

def save_tsv(filename, code_set):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("Hex\tDecimal\n")
        for code in sorted(list(code_set)):
            f.write(f"U+({code:04X})\t{code}\n")

def format_js_array(code_set):
    # 連続する数値をレンジ [start, end] にまとめる処理
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
        
        # 最後の要素
        if start == end:
            ranges.append(f"0x{start:04X}")
        else:
            ranges.append(f"[0x{start:04X}, 0x{end:04X}]")
            
    return "[" + ", ".join(ranges) + "]"

def main():
    # 1. 各サイトから抽出
    url1 = "https://tech-blog.s-yoshiki.com"
    url2 = "https://gigazine.net"
    
    set1 = extract_unicode_from_url(url1)
    set2 = extract_unicode_from_url(url2)
    
    # 2. TSV保存
    save_tsv("1.tsv", set1)
    save_tsv("2.tsv", set2)
    
    # 3. マージ
    merged_set = set1.union(set2)
    save_tsv("3.tsv", merged_set)
    
    # 4. JSソースコード生成
    js_array_str = format_js_array(merged_set)
    js_content = f"""import {{CharGroup}} from "./char-group.js"
export const heuristicInvisibleChars = new CharGroup({js_array_str}, {{ja:'人力抽出した不可視文字', en:'HeuristicInvisibleChars'}});
"""
    
    with open("heuristic-invisible-chars.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print("完了しました。1.tsv, 2.tsv, 3.tsv, および heuristic-invisible-chars.js を作成しました。")

if __name__ == "__main__":
    main()

