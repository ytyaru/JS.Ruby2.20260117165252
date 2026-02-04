#!/bin/bash
cd "$(dirname "$0")"
mkdir -p dist
bun build ./src/manuscript.js --outdir ./dist --target browser
echo "Build complete: lib/text"
