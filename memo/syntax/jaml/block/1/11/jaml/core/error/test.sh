#!/bin/bash
cd "$(dirname "$0")"

echo "Running tests in lib/error..."

if [ -z "$1" ]; then
    # 引数なし: デフォルトのテストファイル(test/main.js)を明示的に指定して実行
    bun test ./test/main.js
else
    # 引数あり: 指定されたファイルを明示的に指定して実行
    # 例: ./test.sh other.js -> bun test ./test/other.js
    bun test "./test/$1"
fi
