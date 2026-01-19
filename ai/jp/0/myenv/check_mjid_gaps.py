import pandas as pd
import os

def check_mjid_gaps(xlsx_path):
    if not os.path.exists(xlsx_path):
        print(f"エラー: {xlsx_path} が見つかりません。")
        return

    print(f"読み込み中: {xlsx_path} (Calamineエンジンを使用)...")
    try:
        # Strict Open XML 形式を正しく読み込むためにエンジンを指定
        df = pd.read_excel(xlsx_path, engine='calamine')
    except Exception as e:
        print(f"Excelの読み込みに失敗しました: {e}")
        return

    # MJID列から数字部分を抽出して整数リストを作成
    # MJ000001 -> 1
    ids = sorted(df['MJ文字図形名'].str.replace('MJ', '').astype(int).tolist())
    
    max_id = max(ids)
    actual_count = len(ids)
    gaps = []
    start_gap = None
    
    # 1から最大値までループして欠番（gaps）を特定
    for i in range(1, max_id + 1):
        if i not in ids:
            if start_gap is None:
                start_gap = i
        else:
            if start_gap is not None:
                gaps.append((start_gap, i - 1))
                start_gap = None
    
    print("-" * 30)
    print(f"MJIDの最大値: MJ{max_id:06d}")
    print(f"実際のデータ件数: {actual_count} 件")
    print(f"総欠番数: {max_id - actual_count} 件")
    print("-" * 30)
    print("主な欠番範囲 (10件以上):")
    for start, end in gaps:
        range_size = end - start + 1
        if range_size >= 10:
            print(f" MJ{start:06d} ～ MJ{end:06d} ({range_size}件)")

if __name__ == "__main__":
    check_mjid_gaps('mji.00602.xlsx')

