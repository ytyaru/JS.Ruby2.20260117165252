import pandas as pd
import os

def extract_svs_characters(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)...")
    try:
        df = pd.read_excel(xlsx_path, engine='calamine')
    except Exception as e:
        print(f"Excelの読み込みに失敗しました: {e}")
        return

    # 必要カラム
    col_mj_id = 'MJ文字図形名'
    col_svs = '実装したSVS'
    col_yomi = '読み(参考)'
    col_remarks = '備考'

    svs_list = []

    print("SVS (標準化された異体字シーケンス) を抽出中...")
    for _, row in df.iterrows():
        svs_val = str(row.get(col_svs, '')).strip()
        
        # 実装したSVSに値があるものを抽出
        if svs_val and svs_val != 'nan':
            mj_id = str(row.get(col_mj_id, ''))
            yomi = str(row.get(col_yomi, '')).replace('nan', '')
            remarks = str(row.get(col_remarks, '')).replace('nan', '')
            
            # MJ番号、SVSコードポイント、読み、備考をタブ区切りで保存
            data = f"{mj_id}\t{svs_val}\t{yomi}\t{remarks}"
            svs_list.append(data)

    output_file = 'svs_characters_list.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("MJ文字図形名\t実装したSVS\t読み\t備考\n")
        for item in svs_list:
            f.write(f"{item}\n")

    print(f"抽出完了！")
    print(f"SVS登録数: {len(svs_list)} 件")

if __name__ == "__main__":
    extract_svs_characters('mji.00602.xlsx')

