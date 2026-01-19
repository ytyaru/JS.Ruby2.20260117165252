import pandas as pd
import os

def extract_all_mj_master_list(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)...")
    try:
        df = pd.read_excel(xlsx_path, engine='calamine')
    except Exception as e:
        print(f"Excelの読み込みに失敗しました: {e}")
        return

    # MJ文字図形名で昇順ソート（MJ000001, MJ000002...）
    print("MJコード順にソート中...")
    df_sorted = df.sort_values('MJ文字図形名')

    # 抽出する主要カラム（配置順の把握に重要なもの）
    target_cols = [
        'MJ文字図形名',
        '実装したUCS',
        '実装したMoji_JohoコレクションIVS',
        '実装したSVS',
        '対応するUCS',
        '部首1(参考)',
        '内画数1(参考)',
        '総画数(参考)',
        '読み(参考)',
        '備考'
    ]

    # カラムの存在を確認しながら抽出
    available_cols = [c for c in target_cols if c in df_sorted.columns]

    output_file = 'all_mj_master_ordered.txt'
    # タブ区切りで保存
    df_sorted[available_cols].to_csv(output_file, sep='\t', index=False, encoding='utf-8')

    print(f"完了！ 全 {len(df_sorted)} 件をMJコード順に出力しました。")
    print(f"出力ファイル: {output_file}")

if __name__ == "__main__":
    extract_all_mj_master_list('mji.00602.xlsx')

