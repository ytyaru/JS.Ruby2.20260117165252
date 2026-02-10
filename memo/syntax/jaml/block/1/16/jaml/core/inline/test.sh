#!/bin/bash
cd "$(dirname "$0")"
echo "Running tests in core/grammar..."

if [ -z "$1" ]; then
    # 引数なし: testディレクトリ配下の全てのテストを再帰的に実行
    bun test ./test/
else
    # 引数あり: 指定されたファイルまたはディレクトリを実行
    # 例: ./test.sh core/node.js
    bun test "./test/$1"
fi

