import pandas as pd

def generate_radical_master():
    """康熙部首番号とUnicode文字の対応表を作成する"""
    # 簡易版として主要な部首の例を構築（本来は214件の全リストを定義）
    # 康熙部首ブロックは U+2F00 から始まる
    radicals = []
    for i in range(1, 215):
        # Unicodeの「康熙部首」文字を算出
        kangxi_cp = 0x2F00 + (i - 1)
        kangxi_char = chr(kangxi_cp)
        
        # 将来的にCJK部首補助とのリンクをここに手動または辞書で追加
        # 例: 番号9(人) -> 2F08(人), 補助2E88(亻)
        radicals.append({
            "Radical_ID": i,
            "Kangxi_Char": kangxi_char,
            "Kangxi_UCS": f"U+{kangxi_cp:04X}",
            "Notes": "CJK部首補助との対応はアプリケーション層で定義"
        })
    
    df_rad = pd.DataFrame(radicals)
    df_rad.to_csv("radical_master.txt", sep="\t", index=False, encoding="utf-8")
    print("部首マスター (radical_master.txt) を生成しました。")

if __name__ == "__main__":
    generate_radical_master()

