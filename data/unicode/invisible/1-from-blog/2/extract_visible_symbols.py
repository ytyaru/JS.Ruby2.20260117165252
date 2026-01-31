#!/usr/bin/env python3
import unicodedata

def is_potentially_visible_symbol(code):
    """
    専用フォントがあれば、具体的な図形（グリフ）として表示されるべき文字を判定。
    """
    name = unicodedata.name(chr(code), "").upper()
    
    # 音楽記号 (Musical Symbols) の判定
    if 0x1D100 <= code <= 0x1D1FF:
        # 以下の名称を含むものは、専用フォントがあっても「不可視」または「制御」
        invisible_musical_keywords = [
            "NULL",         # U+1D159 (NULL NOTEHEAD) など
            "BEGIN",        # U+1D173 (BEGIN BEAM) など
            "END",          # U+1D174 (END BEAM) など
            "START",
            "STOP"
        ]
        if any(kw in name for kw in invisible_musical_keywords):
            return False
        
        # それ以外の音楽記号（音符、休符、譜表記号など）は、専用フォントがあれば「表示」される
        return True

    # ハングル関連
    # U+115F, U+1160, U+3164, U+FFA0 などの "FILLER" は不可視なので False
    if "FILLER" in name:
        return False

    # 点字 (Braille Patterns)
    # U+2800 (空白) 以外は、点が一つ以上ある「図形」なので True
    if 0x2801 <= code <= 0x28FF:
        return True

    return False

def main():
    try:
        with open("3.tsv", "r", encoding="utf-8") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print("エラー: 3.tsv が見つかりません。")
        return

    visible_codes = []
    print("3.tsv から『専用フォントで表示されるべき文字』を抽出中...")

    for line in lines:
        line = line.strip()
        if not line.startswith("0x"): continue
        try:
            code = int(line, 16)
            if is_potentially_visible_symbol(code):
                visible_codes.append(code)
        except ValueError: continue

    #with open("4.tsv", "w", encoding="utf-8") as f:
    with open("3-1-auto.tsv", "w", encoding="utf-8") as f:
        for code in sorted(visible_codes):
            f.write(f"0x{code:04X}\n")
            
    #print(f"完了: 4.tsv を作成しました（抽出数: {len(visible_codes)} 文字）。")
    print(f"完了: 3-1-auto.tsv を作成しました（抽出数: {len(visible_codes)} 文字）。")

if __name__ == "__main__":
    main()

