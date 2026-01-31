#!/usr/bin/env python3

# 引数ごとの説明文を定義
HELP_CATE_WHITE = "含めるカテゴリ/由来を指定 (カンマ区切り)"
HELP_CATE_BLACK = "除外するカテゴリ/由来を指定 (カンマ区切り)"
HELP_ADD_LIST   = "追加する外部ファイル (カンマ区切り)"
HELP_BAN_LIST   = "除外する外部ファイル (カンマ区切り)"
HELP_OFF_CATE   = "merge.tsvに情報を出力しない"

# build.sh などの統合ヘルプで表示するための整形済みテキスト
HELP_PARAM_SUMMARY = f"""
引数設定 (フィルタリング/マージ用):
  --cate-white [VALUE] : {HELP_CATE_WHITE}
  --cate-black [VALUE] : {HELP_CATE_BLACK}
  --add-list   [FILE]  : {HELP_ADD_LIST}
  --ban-list   [FILE]  : {HELP_BAN_LIST}
  --off-cate           : {HELP_OFF_CATE}
"""

