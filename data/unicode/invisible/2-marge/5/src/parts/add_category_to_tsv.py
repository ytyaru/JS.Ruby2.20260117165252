#!/usr/bin/env python3
import unicodedata

def get_category_for_code(code):
    """
    指定された整数コードポイントのUnicodeカテゴリを取得する。
    """
    try:
        return unicodedata.category(chr(code))
    except (ValueError, OverflowError):
        return "Unknown"

def enrich_codes_with_category(codes):
    """
    コードポイントのセットを受け取り、{code: category} の辞書を返す。
    """
    result = {}
    for code in codes:
        result[code] = get_category_for_code(code)
    return result

if __name__ == "__main__":
    # 単体実行時のテスト用（例: 0x0020 を引数にとる等）
    import sys
    if len(sys.argv) > 1:
        try:
            c = int(sys.argv[1], 16)
            print(f"U+{c:04X}\t{get_category_for_code(c)}")
        except ValueError:
            print("Usage: add_category_to_option_file.py 0xXXXX")

