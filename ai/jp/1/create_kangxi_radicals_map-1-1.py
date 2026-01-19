import csv
import re

def create_kangxi_radicals_map():
    """康熙部首の番号、文字、Unicodeコードのマッピングを作成する"""
    radicals = {}
    for i in range(214):
        radical_num = i + 1
        code_point = 0x2F00 + i
        char = chr(code_point)
        unicode_str = f"U+{code_point:04X}"
        radicals[radical_num] = {
            "kangxi_radical_char": char,
            "kangxi_radical_unicode": unicode_str,
        }
    return radicals

def create_char_to_radical_num_map(filename="Unihan_RadicalStrokeCounts.txt"):
    """Unihan_RadicalStrokeCounts.txt から漢字と部首番号のマッピングを作成する"""
    mapping = {}
    try:
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.strip().split("\t")
                if len(parts) >= 3 and parts[1] == "kRSUnicode":
                    ucode_str = parts[0]
                    code_point = int(ucode_str[2:], 16)
                    char = chr(code_point)
                    
                    radical_info = parts[2]
                    match = re.match(r"(\d+)", radical_info)
                    if match:
                        radical_num = int(match.group(1))
                        mapping[char] = radical_num
    except FileNotFoundError:
        print(f"エラー: {filename} が見つかりません。")
        return None
    return mapping

def create_supplement_to_char_map(filename="EquivalentUnifiedIdeograph.txt"):
    """EquivalentUnifiedIdeograph.txt からCJK部首補助と対応漢字のマッピングを作成する"""
    mapping = {}
    try:
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                # コメントを除去
                line = line.split("#")[0].strip()
                if not line:
                    continue
                
                parts = line.split(";")
                if len(parts) < 2:
                    continue
                    
                source_range = parts[0].strip()
                target_hex = parts[1].strip()
                target_char = chr(int(target_hex, 16))
                
                # 範囲の処理 (例: "2E80..2E80" または "2E80")
                if ".." in source_range:
                    start_hex, end_hex = source_range.split("..")
                    start_code = int(start_hex, 16)
                    end_code = int(end_hex, 16)
                else:
                    start_code = end_code = int(source_range, 16)
                
                # CJK部首補助の範囲 (U+2E80–U+2EFF) のみ対象とする
                for code_point in range(start_code, end_code + 1):
                    if 0x2E80 <= code_point <= 0x2EFF:
                        supp_char = chr(code_point)
                        mapping[supp_char] = target_char
    except FileNotFoundError:
        print(f"エラー: {filename} が見つかりません。")
        return None
    return mapping

def main():
    print("康熙部首の基本データを作成中...")
    kangxi_radicals = create_kangxi_radicals_map()
    
    print("漢字と部首番号のマッピングを作成中...")
    char_to_radical_num = create_char_to_radical_num_map()
    if char_to_radical_num is None:
        return

    print("CJK部首補助と対応漢字のマッピングを作成中...")
    supplement_to_char = create_supplement_to_char_map()
    if supplement_to_char is None:
        return

    master_data = []
    
    # CJK部首補助のループ
    for supp_char, target_char in supplement_to_char.items():
        supp_code_point = ord(supp_char)
        supp_unicode_str = f"U+{supp_code_point:04X}"
        
        # 対応する漢字から部首番号を取得
        radical_num = char_to_radical_num.get(target_char)
        
        if radical_num and radical_num in kangxi_radicals:
            kangxi_info = kangxi_radicals[radical_num]
            master_data.append({
                "kangxi_radical_number": radical_num,
                "kangxi_radical_char": kangxi_info["kangxi_radical_char"],
                "kangxi_radical_unicode": kangxi_info["kangxi_radical_unicode"],
                "cjk_supplement_char": supp_char,
                "cjk_supplement_unicode": supp_unicode_str,
            })

    output_filename = "kangxi_cjk_supplement_mapping.csv"
    try:
        with open(output_filename, "w", newline="", encoding="utf-8") as csvfile:
            fieldnames = [
                "kangxi_radical_number",
                "kangxi_radical_char",
                "kangxi_radical_unicode",
                "cjk_supplement_char",
                "cjk_supplement_unicode",
            ]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in sorted(master_data, key=lambda x: x["kangxi_radical_number"]):
                writer.writerow(row)
        print(f"処理が完了しました。{len(master_data)}件のデータが '{output_filename}' に出力されました。")
    except IOError:
        print(f"エラー: ファイル '{output_filename}' の書き込みに失敗しました。")

if __name__ == "__main__":
    main()
