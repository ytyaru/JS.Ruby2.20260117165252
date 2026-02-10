#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
# main.js をエントリポイントとしてバンドル
bun build ./src/main.js --outdir ./dist --target browser
echo "Build complete: core/grammar"

