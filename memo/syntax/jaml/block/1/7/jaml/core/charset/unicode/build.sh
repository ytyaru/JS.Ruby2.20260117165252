#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
bun build ./src/main.js --outdir ./dist --target browser
echo "Build complete: core/charset/unicode"
