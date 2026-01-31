#!/usr/bin/env python3

HELP_DESCRIPTION = "merge.tsv を読み込み、JavaScript 用の CharGroup 定義ファイルを生成します。"

HELP_EPILOG = """
入力ファイル (dist/db/):
  merge.tsv          : 統合された不可視文字リスト

出力ファイル (dist/):
  invisible-chars.js : JavaScript 用の CharGroup 定義ファイル

仕様:
  - 連続するコードポイントは [0xXXXX, 0xXXXX] のレンジ形式に変換されます。
  - 数値およびレンジごとに改行とインデントを施して出力します。
"""

