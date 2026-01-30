#!/usr/bin/env python3
from help.category import HELP_SUB_EPILOG

HELP_DESCRIPTION = "Unicode不可視文字ライブラリ構築ツール\n各工程（分類・マージ・JS生成）を一括で実行します。"

HELP_EPILOG = """
全工程の流れ:
  1. src/categorize-tsv.py : 由来別に3分類し dist/db/categorize/ へ出力
  2. src/merge-tsv.py      : 条件に基づきフィルタリングし dist/db/merge.tsv を作成
  3. src/generate-js.py    : merge.tsv から dist/invisible-chars.js を生成

主な入出力ファイル一式:
  src/db/                 [入力]
    unicode.tsv             基本リスト (Code\tCategory)
    heuristic.tsv           補完リスト (0xXXXX)
  dist/
    db/
      categorize/         [中間]
        only-unicode.tsv    unicode.tsvのみに存在
        only-heuristic.tsv  heuristic.tsvのみに存在
        both.tsv            両方に存在
      merge.tsv           [出力] 最終統合リスト
    invisible-chars.js    [出力] JavaScript CharGroup定義
""" + HELP_SUB_EPILOG

