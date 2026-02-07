#!/bin/bash
cd "$(dirname "$0")"
echo "Running tests in $(basename $(pwd))..."

if [ -z "$1" ]; then
    # 引数なし: testディレクトリ以下の全jsファイルを検索して実行
    find ./test -name "*.js" -print0 | xargs -0 bun test
else
    TARGET="./test/$1"
    
    if [ -f "$TARGET" ]; then
        bun test "$TARGET"
    elif [ -f "${TARGET}.js" ]; then
        bun test "${TARGET}.js"
    elif [ -d "$TARGET" ]; then
        find "$TARGET" -name "*.js" -print0 | xargs -0 bun test
    else
        echo "Error: Target not found: $1"
        exit 1
    fi
fi
