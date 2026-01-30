#!/bin/bash

# 1. 仮想環境の作成（既にある場合はスキップ）
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# 2. 仮想環境内の pip を直接使ってインストール
# これにより activate せずとも環境が隔離されます
echo "Installing dependencies..."
./.venv/bin/pip install requests beautifulsoup4

# 3. 外部化した Python スクリプトを実行
if [ -f "build_invisible_list.py" ]; then
    echo "Running build_invisible_list.py..."
    ./.venv/bin/python3 build_invisible_list.py
else
    echo "Error: build_invisible_list.py not found."
fi
