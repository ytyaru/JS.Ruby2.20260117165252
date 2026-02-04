#!/bin/bash
cd "$(dirname "$0")"

echo "Running tests in lib/error..."

if [ -z "$1" ]; then
    # 引数なし: ルートのテストを実行
    bun ./test/main.js
else
    # 引数あり: 指定されたパス（test/配下）を実行
    # 例: ./test.sh some/other.js -> bun ./test/some/other.js
    bun "./test/$1"
fi
