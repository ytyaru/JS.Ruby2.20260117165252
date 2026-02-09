#!/bin/bash
# スクリプトのあるディレクトリに移動
cd "$(dirname "$0")"

echo "Running tests in $(basename $(pwd))..."

if [ -z "$1" ]; then
    # 引数なし: testディレクトリ以下の全jsファイルを検索して実行
    # findの結果をxargsでbun testに渡す
    find ./test -name "*.js" -print0 | xargs -0 bun test
else
    TARGET="./test/$1"
    
    if [ -f "$TARGET" ]; then
        # ファイル指定あり (例: core/node.js)
        bun test "$TARGET"
    elif [ -f "${TARGET}.js" ]; then
        # 拡張子省略時の対応 (例: core/node)
        bun test "${TARGET}.js"
    elif [ -d "$TARGET" ]; then
        # ディレクトリ指定あり (例: core) -> 配下の全jsファイルを検索して実行
        find "$TARGET" -name "*.js" -print0 | xargs -0 bun test
    else
        echo "Error: Target not found: $1"
        exit 1
    fi
fi

