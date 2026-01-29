#!/bin/bash

# スクリプトが設置されているディレクトリに移動
cd "$(dirname "$0")"

# テストファイルのベースパス
TEST_DIR="./test"

# 第1引数 ($1) が存在するかどうかで処理を分岐
if [ -n "$1" ]; then
  # 引数が存在する場合、その引数を使ってテスト対象ファイルを指定
  TARGET_FILE="${TEST_DIR}/$1.js"
  echo "部分テストを実行します: ${TARGET_FILE}"
  bun test "${TARGET_FILE}"
else
  # 引数が存在しない場合、testディレクトリ内の全.jsファイルを実行
  echo "全件テストを実行します: ${TEST_DIR}/*.js"
  bun test ${TEST_DIR}/*.js
fi
