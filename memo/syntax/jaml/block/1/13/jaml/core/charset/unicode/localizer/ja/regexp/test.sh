#!/bin/bash
cd "$(dirname "$0")"
echo "Running tests in core/charset/unicode/localizer/ja/regexp..."

if [ -z "$1" ]; then
    bun test ./test/main.js
else
    bun test "./test/$1"
fi

