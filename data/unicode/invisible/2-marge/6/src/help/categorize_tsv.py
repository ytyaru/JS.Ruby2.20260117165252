#!/usr/bin/env python3

HELP_DESCRIPTION = "unicode.tsv と heuristic.tsv を比較し、由来別に分類します。"

HELP_EPILOG = """
入力ファイル (src/db/):
  unicode.tsv    : Unicodeカテゴリ抽出リスト(Code\tCategory): Cc,Cf,Zs,Zl,Zp,Mn
  heuristic.tsv  : 人力抽出補完リスト(0xXXXX): Unicodeカテゴリでは特定不能

出力ファイル (dist/db/categorize/):
  only-unicode.tsv   : unicode.tsvにのみ存在
  only-heuristic.tsv : heuristic.tsvにのみ存在
  both.tsv           : 両方のファイルに存在
"""
