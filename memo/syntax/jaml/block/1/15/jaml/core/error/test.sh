#!/bin/bash
cd "$(dirname "$0")"
echo "Running tests in core/error..."

if [ -z "$1" ]; then
    # 引数なし: デフォルトのテストファイルを実行
    bun test ./test/main.js
else
    # 引数あり: 指定されたファイルを実行
    bun test "./test/$1"
fi

