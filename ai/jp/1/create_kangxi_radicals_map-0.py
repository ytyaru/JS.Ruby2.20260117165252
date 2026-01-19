import csv
import re

def create_kangxi_radicals_map():
    """康熙部首の番号、文字、Unicodeコードのマッピングを作成する"""
    radicals = {}
    for i in range(214):
        radical_num = i + 1
        # 康熙部首ブロックの開始コードポイントは U+2F00
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
                    # U+4E00 のような形式から 16進数の数値を取得
                    code_point = int(ucode_str[2:], 16)
                    char = chr(code_point)
                    
                    # 1.0, 2.3 のような形式から部首番号（整数部分）を取得
                    radical_info = parts[2]
                    match = re.match(r"(\d+)", radical_info)
                    if match:
                        radical_num = int(match.group(1))
                        mapping[char] = radical_num
    except FileNotFoundError:
        print(f"エラー: {filename} が見つかりません。")
        print("Unihanデータベースをダウンロードし、同じディレクトリに配置してください。")
        return None
    return mapping

def create_supplement_to_char_map(filename="Unihan_Variants.txt"):
    """Unihan_Variants.txt からCJK部首補助と対応漢字のマッピングを作成する"""
    mapping = {}
    try:
        with open(filename, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("#") or not line.strip():
                    continue
                parts = line.strip().split("\t")
                if len(parts) >= 3 and parts[1] == "kCompatibilityVariant":
                    # CJK部首補助のコードポイントを取得
                    supp_ucode_str = parts[0]
                    supp_code_point = int(supp_ucode_str[2:], 16)
                    
                    # CJK部首補助の範囲 (U+2E80–U+2EFF) のみ対象とする
                    if 0x2E80 <= supp_code_point <= 0x2EFF:
                        supp_char = chr(supp_code_point)
                        
                        # 対応する統合漢字のコードポイントを取得
                        # U+4E00<kCompatibilityVariant のような形式から U+4E00 を抽出
                        target_ucode_str = parts[2].split("<")[0]
                        target_code_point = int(target_ucode_str[2:], 16)
                        target_char = chr(target_code_point)
                        
                        mapping[supp_char] = target_char
    except FileNotFoundError:
        print(f"エラー: {filename} が見つかりません。")
        print("Unihanデータベースをダウンロードし、同じディレクトリに配置してください。")
        return None
    return mapping

def main():
    """メイン処理"""
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

    # マスターデータを作成
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

    # CSVファイルに出力
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
            # 康熙部首番号でソートして書き込み
            for row in sorted(master_data, key=lambda x: x["kangxi_radical_number"]):
                writer.writerow(row)
        print(f"処理が完了しました。'{output_filename}' が作成されました。")
    except IOError:
        print(f"エラー: ファイル '{output_filename}' の書き込みに失敗しました。")

if __name__ == "__main__":
    main()
