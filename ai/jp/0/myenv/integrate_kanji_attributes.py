import pandas as pd
import os
import sys

def get_offset():
    """コマンドライン引数からオフセットを取得する"""
    if len(sys.argv) < 2:
        return 0
    val = sys.argv[1]
    try:
        if val.startswith('0x') or val.startswith('0X'):
            offset = int(val, 16)
        else:
            offset = int(val)
        if offset < 0:
            raise ValueError
        return offset
    except ValueError:
        print("引数値はオフセット値であり10進数の整数値であるべきです。16進数で入力する時は0xから開始してください。", file=sys.stderr)
        sys.exit(1)

def integrate_kanji_attributes(xlsx_path):
    offset = get_offset()
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。", file=sys.stderr)
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)... オフセット: {offset}")
    df = pd.read_excel(xlsx_path, engine='calamine')

    df_sorted = df.sort_values('MJ文字図形名').copy()

    # オフセットを加算した独自コードポイントを生成
    df_sorted['NewCode_Hex'] = [f"0x{i + offset:04X}" for i in range(len(df_sorted))]
    
    def get_status(row):
        impl = str(row.get('実装したUCS', '')).strip()
        resp = str(row.get('対応するUCS', '')).strip()
        if impl != '' and impl != 'nan':
            return 'IMPLEMENTED'
        elif resp != '' and resp != 'nan':
            return 'UNIMPLEMENTED_WITH_RELATION'
        else:
            return 'UNIMPLEMENTED_ISOLATED'

    df_sorted['区分'] = df_sorted.apply(get_status, axis=1)

    target_cols = [
        'NewCode_Hex', 'MJ文字図形名', '区分', '実装したUCS', 
        '実装したMoji_JohoコレクションIVS', '実装したSVS', 
        '対応するUCS', '部首1(参考)', '総画数(参考)', '読み(参考)', '備考'
    ]

    output_file = 'japanese_exclusive_charset_v1.txt'
    df_sorted[target_cols].to_csv(output_file, sep='\t', index=False, encoding='utf-8')
    
    last_code = len(df_sorted) + offset - 1
    print(f"完了！ 総文字数: {len(df_sorted)} (開始: 0x{offset:04X} ～ 終了: 0x{last_code:04X})")

if __name__ == "__main__":
    integrate_kanji_attributes('mji.00602.xlsx')

