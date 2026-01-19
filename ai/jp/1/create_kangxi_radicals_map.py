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
        print("Unihanデータベースからダウンロードしたファイルを、このスクリプトと同じディレクトリに配置してください。")
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
                    supp_ucode_str = parts[0]
                    supp_code_point = int(supp_ucode_str[2:], 16)
                    if 0x2E80 <= supp_code_point <= 0x2EFF:
                        supp_char = chr(supp_code_point)
                        target_ucode_str = parts[2].split("<")[0]
                        target_code_point = int(target_ucode_str[2:], 16)
                        target_char = chr(target_code_point)
                        mapping[supp_char] = target_char
    except FileNotFoundError:
        print(f"エラー: {filename} が見つかりません。")
        print("Unihanデータベースからダウンロードしたファイルを、このスクリプトと同じディレクトリに配置してください。")
        return None
    return mapping

def main():
    """メイン処理"""
    print("処理を開始します...")
    
    print("\nステップ1: 康熙部首の基本データを作成中...")
    kangxi_radicals = create_kangxi_radicals_map()
    print(f"  -> {len(kangxi_radicals)} 件の康熙部首データを生成しました。")

    print("\nステップ2: 漢字と部首番号のマッピングを作成中 (Unihan_RadicalStrokeCounts.txt)...")
    char_to_radical_num = create_char_to_radical_num_map()
    if char_to_radical_num is None:
        return
    print(f"  -> {len(char_to_radical_num)} 件の漢字と部首番号のマッピングを生成しました。")

    print("\nステップ3: CJK部首補助と対応漢字のマッピングを作成中 (Unihan_Variants.txt)...")
    supplement_to_char = create_supplement_to_char_map()
    if supplement_to_char is None:
        return
    print(f"  -> {len(supplement_to_char)} 件のCJK部首補助と対応漢字のマッピングを生成しました。")

    # マスターデータを作成
    master_data = []
    
    print("\nステップ4: 各データを結合してマスターデータを作成中...")
    for supp_char, target_char in supplement_to_char.items():
        radical_num = char_to_radical_num.get(target_char)
        if radical_num and radical_num in kangxi_radicals:
            kangxi_info = kangxi_radicals[radical_num]
            master_data.append({
                "kangxi_radical_number": radical_num,
                "kangxi_radical_char": kangxi_info["kangxi_radical_char"],
                "kangxi_radical_unicode": kangxi_info["kangxi_radical_unicode"],
                "cjk_supplement_char": supp_char,
                "cjk_supplement_unicode": f"U+{ord(supp_char):04X}",
            })

    print(f"  -> {len(master_data)} 件のマスターデータを生成しました。")

    if not master_data:
        print("\n[警告] CSVに出力するデータが1件も生成されませんでした。")
        print("以下の点を確認してください:")
        print("1. `Unihan_RadicalStrokeCounts.txt` と `Unihan_Variants.txt` がスクリプトと同じディレクトリにありますか？")
        print("2. 上記ファイルのサイズが0KBになっていませんか？（正常にダウンロードされているか確認）")
        print("3. ステップ2とステップ3で表示された件数が0になっていませんか？")
        return

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
            for row in sorted(master_data, key=lambda x: x["kangxi_radical_number"]):
                writer.writerow(row)
        print(f"\n処理が完了しました。'{output_filename}' が作成されました。")
    except IOError:
        print(f"エラー: ファイル '{output_filename}' の書き込みに失敗しました。")

if __name__ == "__main__":
    main()
