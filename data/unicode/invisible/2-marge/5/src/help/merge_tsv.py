#!/usr/bin/env python3
from help.category import HELP_SUB_EPILOG

HELP_DESCRIPTION = "分類された中間ファイルを統合し、指定条件でフィルタリングを行います。"

HELP_EPILOG = """
入力ファイル (dist/db/categorize/):
  only-unicode.tsv  : unicode.tsvにのみ存在する文字リスト
  only-heuristic.tsv: heuristic.tsvにのみ存在する文字リスト
  both.tsv          : 両方のファイルに存在する文字リスト

出力ファイル (dist/db/):
  merge.tsv         : フィルタリング適用後の最終統合リスト
""" + HELP_SUB_EPILOG

