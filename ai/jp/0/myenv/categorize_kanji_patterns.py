import pandas as pd
import os

def categorize_kanji_patterns(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジン)...")
    df = pd.read_excel(xlsx_path, engine='calamine')

    # カラム名
    col_mj_id = 'MJ文字図形名'
    col_uni_impl = '実装したUCS'
    col_uni_resp = '対応するUCS'
    col_yomi = '読み(参考)'

    list_mu_yu = [] # 無・有 (類字あり)
    list_mu_mu = [] # 無・無 (完全未定義)

    print("パターン別に分類中...")
    for _, row in df.iterrows():
        mj_id = str(row.get(col_mj_id, ''))
        uni_impl = str(row.get(col_uni_impl, '')).strip()
        uni_resp = str(row.get(col_uni_resp, '')).strip()
        
        # 実装UCSが空（nan または空文字）の場合
        if not uni_impl or uni_impl == 'nan':
            yomi = str(row.get(col_yomi, '')).replace('nan', '')
            data = f"{mj_id}\t{uni_resp}\t{yomi}"
            
            if not uni_resp or uni_resp == 'nan':
                list_mu_mu.append(data)
            else:
                list_mu_yu.append(data)

    # 保存処理
    with open('pattern_mu_yu_list.txt', 'w', encoding='utf-8') as f:
        f.write("MJ文字図形名\t対応UCS\t読み\n")
        for item in list_mu_yu: f.write(f"{item}\n")

    with open('pattern_mu_mu_list.txt', 'w', encoding='utf-8') as f:
        f.write("MJ文字図形名\t対応UCS\t読み\n")
        for item in list_mu_mu: f.write(f"{item}\n")

    print(f"分類完了！")
    print(f"・類字あり未定義(無・有): {len(list_mu_yu)} 件")
    print(f"・完全未定義(無・無): {len(list_mu_mu)} 件")

if __name__ == "__main__":
    categorize_kanji_patterns('mji.00602.xlsx')

