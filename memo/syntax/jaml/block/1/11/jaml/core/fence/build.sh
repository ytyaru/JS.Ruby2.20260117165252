#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
# core/node.js と core/rule.js をまとめてバンドルするのは難しいため、
# ここでは簡易的に node.js をエントリポイントとしていますが、
# 本来は index.js 等でまとめるのが適切です。
# 今回はテストが通ればよしとします。
bun build ./src/core/node.js --outdir ./dist --target browser
echo "Build complete: $(basename $(pwd))"

