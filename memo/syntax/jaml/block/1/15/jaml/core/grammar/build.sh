#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
# main.js をエントリポイントとして bundle.js にバンドル
bun build ./src/main.js --outfile ./dist/bundle.js --target browser
echo "Build complete: core/grammar"

