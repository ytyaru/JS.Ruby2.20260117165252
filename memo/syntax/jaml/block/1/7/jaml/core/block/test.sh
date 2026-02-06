#!/bin/bash
cd "$(dirname "$0")"
echo "Running tests in $(basename $(pwd))..."

if [ -z "$1" ]; then
    # testディレクトリ内の全てのjsファイルを実行
    bun test ./test/*.js
else
    bun test "./test/$1"
fi

