#!/bin/bash
# スクリプトのあるディレクトリに移動
cd "$(dirname "$0")"

# 出力先ディレクトリの作成
mkdir -p dist

# src/main.js をエントリポイントとしてバンドルを実行
# --outfile で pj.txt 定義の bundle.js を指定
# --target browser でブラウザ向けに出力
bun build ./src/main.js --outfile ./dist/bundle.js --target browser

echo "Build complete: core/block"

