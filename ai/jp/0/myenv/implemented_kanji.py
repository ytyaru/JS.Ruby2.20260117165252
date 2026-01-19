import pandas as pd
import os

def extract_ipa_mj_master(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジンを使用)...")
    
    try:
        # engine='calamine' で Strict Open XML 形式を読み込む
        df = pd.read_excel(xlsx_path, engine='calamine')
    except Exception as e:
        print(f"Excelの読み込みに失敗しました: {e}")
        return

    # 最新のカラム名に合わせて特定
    # Unicode用: 「実装したUCS」
    # IVS用: 「実装したMoji_JohoコレクションIVS」
    col_uni = '実装したUCS'
    col_ivs = '実装したMoji_JohoコレクションIVS'

    if col_uni not in df.columns:
        print(f"エラー: カラム '{col_uni}' が見つかりません。")
        return

    jp_kanji_list = set()

    print("コードポイントを抽出中...")
    for _, row in df.iterrows():
        unicode_val = str(row.get(col_uni, ''))
        ivs_val = str(row.get(col_ivs, ''))

        # 基本Unicodeの抽出 (U+XXXX 形式)
        if unicode_val and 'U+' in unicode_val:
            for u in unicode_val.split():
                if u.startswith('U+'):
                    jp_kanji_list.add(u.strip())

        # IVSの抽出 (U+XXXX_U+EXXXX 形式)
        if ivs_val and 'U+' in ivs_val:
            for i in ivs_val.split():
                if 'U+' in i:
                    jp_kanji_list.add(i.strip())

    unique_list = sorted(list(jp_kanji_list))
    output_file = 'jp_kanji_ipa_master.txt'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for item in unique_list:
            f.write(f"{item}\n")

    print(f"成功！ ファイル名: {output_file}")
    print(f"登録数: {len(unique_list)} 件")

if __name__ == "__main__":
    extract_ipa_mj_master('mji.00602.xlsx')
