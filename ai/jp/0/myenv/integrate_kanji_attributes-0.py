import pandas as pd
import os

def integrate_kanji_attributes(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)...")
    df = pd.read_excel(xlsx_path, engine='calamine')

    # MJID順にソート
    df_sorted = df.sort_values('MJ文字図形名').copy()

    # 独自コードポイント(NewCode)を付与 (0x0000 ～)
    df_sorted['NewCode_Hex'] = [f"0x{i:04X}" for i in range(len(df_sorted))]
    
    # 状態（Status）を判定するロジック
    def get_status(row):
        impl = str(row.get('実装したUCS', '')).strip()
        resp = str(row.get('対応するUCS', '')).strip()
        if impl != '' and impl != 'nan':
            return 'IMPLEMENTED'
        elif resp != '' and resp != 'nan':
            return 'UNIMPLEMENTED_WITH_RELATION'
        else:
            return 'UNIMPLEMENTED_ISOLATED'

    print("属性情報を統合中...")
    df_sorted['区分'] = df_sorted.apply(get_status, axis=1)

    # 抽出する属性カラム
    target_cols = [
        'NewCode_Hex',
        'MJ文字図形名',
        '区分',
        '実装したUCS',
        '実装したMoji_JohoコレクションIVS',
        '実装したSVS',
        '対応するUCS',
        '部首1(参考)',
        '総画数(参考)',
        '読み(参考)',
        '備考'
    ]

    output_file = 'japanese_exclusive_charset_v1.txt'
    df_sorted[target_cols].to_csv(output_file, sep='\t', index=False, encoding='utf-8')

    print(f"完了！ 仕様書ファイル: {output_file}")
    print(f"総文字数: {len(df_sorted)} (0x0000 ～ 0x{len(df_sorted)-1:04X})")

if __name__ == "__main__":
    integrate_kanji_attributes('mji.00602.xlsx')

