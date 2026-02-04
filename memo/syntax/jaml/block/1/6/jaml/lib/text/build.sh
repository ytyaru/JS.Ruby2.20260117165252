#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
# Manuscriptをエントリポイントとしてビルド
bun build ./src/manuscript.js --outdir ./dist --target browser
echo "Build complete: lib/text/dist/manuscript.js"
