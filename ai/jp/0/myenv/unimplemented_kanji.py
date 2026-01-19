import pandas as pd
import os

def extract_unimplemented_mj_kanji(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)...")
    
    try:
        df = pd.read_excel(xlsx_path, engine='calamine')
    except Exception as e:
        print(f"Excelの読み込みに失敗しました: {e}")
        return

    # 必要なカラムの定義
    col_mj_id = 'MJ文字図形名'
    col_uni_impl = '実装したUCS'  # 空であることを確認する列
    col_uni_resp = '対応するUCS'  # 似た字（将来の包摂先候補）
    col_yomi = '読み(参考)'
    col_strokes = '総画数(参考)'

    # 抽出リスト
    unimplemented_list = []

    print("Unicode未実装文字を抽出中...")
    for _, row in df.iterrows():
        mj_id = str(row.get(col_mj_id, ''))
        uni_impl = str(row.get(col_uni_impl, ''))

        # 「実装したUCS」が空、あるいは 'nan' のものを抽出
        if mj_id and (not uni_impl or uni_impl == 'nan'):
            resp_uni = str(row.get(col_uni_resp, '')).replace('nan', '')
            yomi = str(row.get(col_yomi, '')).replace('nan', '')
            strokes = str(row.get(col_strokes, '')).replace('nan', '')
            
            # タブ区切りで情報を整理
            line = f"{mj_id}\t{resp_uni}\t{strokes}\t{yomi}"
            unimplemented_list.append(line)

    output_file = 'unimplemented_jp_kanji_list.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        # ヘッダー付与
        f.write("MJ文字図形名\t対応するUCS(参考)\t総画数\t読み(参考)\n")
        for item in unimplemented_list:
            f.write(f"{item}\n")

    print(f"成功！ ファイル名: {output_file}")
    print(f"未実装文字数: {len(unimplemented_list)} 件")

if __name__ == "__main__":
    extract_unimplemented_mj_kanji('mji.00602.xlsx')

