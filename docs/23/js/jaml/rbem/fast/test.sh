#!/bin/bash

# スクリプトが設置されているディレクトリに移動
cd "$(dirname "$0")"

# bun testコマンドを実行
# 引数にファイルパスを指定すると、そのファイルだけをテスト対象とする
bun test ./test/main.js

