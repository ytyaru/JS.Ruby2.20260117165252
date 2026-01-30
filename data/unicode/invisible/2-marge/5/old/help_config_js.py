#!/usr/bin/env python3

JS_HELP_DESCRIPTION = "merge.tsv を読み込み、JavaScript 用の CharGroup 定義ファイルを生成します。"

JS_HELP_EPILOG = """
入出力ファイル:
  merge.tsv          [入力] 統合された不可視文字リスト (書式: Code\\tCategory\\tOrigin)
  invisible-chars.js [出力] JavaScript 用の CharGroup 定義。要素ごとに改行・インデントされます。

CharGroup 仕様:
  第1引数: 数値(0xXXXX)またはレンジ([0xXXXX, 0xXXXX])の配列
  第2引数: メタデータ(ja: 日本語名, en: 英語名)
"""

