#!/bin/bash
cd "$(dirname "$0")"

echo "Running tests in lib/text..."

if [ -z "$1" ]; then
    bun test ./test/manuscript.js
else
    bun test "./test/$1"
fi
