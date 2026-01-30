#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import re
import sys

def extract_unicode_from_url(url):
    print(f"Fetching: {url}")
    try:
        # User-Agentを設定してブラウザを装う
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.encoding = response.apparent_encoding
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. ページ内の全テキストを取得
        # 2. U+XXXX 形式（大文字小文字問わず）を検索
        # 3. HTMLソース全体からも検索（属性値に含まれる場合があるため）
        raw_content = soup.get_text() + response.text
        
        # 正規表現を緩和: U+の後に4〜6桁の16進数
        found_codes = re.findall(r'[uU]\+([0-9a-fA-F]{4,6})', raw_content)
        
        codes = {int(c, 16) for c in found_codes}
        print(f"Found {len(codes)} characters from {url}")
        return codes
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return set()

def save_tsv(filename, code_set):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("Hex\tDecimal\n")
        # 昇順にソートして保存
        for code in sorted(list(code_set)):
            f.write(f"U+{code:04X}\t{code}\n")

def format_js_array(code_set):
    sorted_codes = sorted(list(code_set))
    if not sorted_codes: return "[]"
    
    ranges = []
    if len(sorted_codes) > 0:
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
    # ターゲットURL
#    url1 = "https://tech-blog.s-yoshiki.com"
    url1 = "https://tech-blog.s-yoshiki.com/entry/303"
    url2 = "https://gigazine.net/gsc_news/en/20221208-invisible-characters/"
    
    set1 = extract_unicode_from_url(url1)
    set2 = extract_unicode_from_url(url2)
    
    # 万が一両方空だった場合の保険（これら記事で紹介されている主要文字）
    if not set1 and not set2:
        print("Warning: No characters extracted. Using fallback common list.")
        fallback = {0x0020, 0x00A0, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x200B, 0x200C, 0x200D, 0x202F, 0x205F, 0x3000, 0x3164, 0xFEFF}
        set1.update(fallback)

    save_tsv("1.tsv", set1)
    save_tsv("2.tsv", set2)
    
    merged = set1.union(set2)
    save_tsv("3.tsv", merged)
    
    js_content = (
        f'import {{CharGroup}} from "./char-group.js"\n'
        f'export const heuristicInvisibleChars = new CharGroup({format_js_array(merged)}, '
        f'{{ja:\'人力抽出した不可視文字\', en:\'HeuristicInvisibleChars\'}});\n'
    )
    
    with open("heuristic-invisible-chars.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"Success: Created files with {len(merged)} unique characters.")
