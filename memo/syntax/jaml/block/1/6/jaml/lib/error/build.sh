#!/bin/bash
# スクリプトのあるディレクトリに移動
cd "$(dirname "$0")"

# 出力先作成
mkdir -p dist

# ビルド実行
bun build ./src/main.js --outdir ./dist --target browser

echo "Build complete: lib/error"
