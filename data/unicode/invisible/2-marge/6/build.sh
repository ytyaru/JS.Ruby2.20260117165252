#!/bin/bash

set -e
cd "$(dirname "$0")"

# ヘルプが要求された場合の処理
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    # 1. プロジェクトルートを検索パスの最優先(0番)に追加
    # 2. helpディレクトリがある場所(src)もパスに追加
    # 3. 組み込みのhelpと衝突しないよう、絶対パス指定でインポートを試みる
    python3 -c "import sys, os; \
                root = os.getcwd(); \
                sys.path.insert(0, root); \
                sys.path.insert(0, os.path.join(root, 'src')); \
                from help.build import HELP_DESCRIPTION, HELP_EPILOG; \
                print(HELP_DESCRIPTION + '\n' + HELP_EPILOG, end='')"
    exit 0
fi

echo "--- [1/3] 由来別の分類を実行中... ---"
./src/categorize_tsv.py

echo -e "\n--- [2/3] フィルタリングとマージを実行中... ---"
./src/merge_tsv.py "$@"

echo -e "\n--- [3/3] JavaScriptコードを生成中... ---"
./src/generate_js.py

echo -e "\n=========================================="
echo " 全工程が正常に完了しました。"
echo " 成果物: dist/invisible-chars.js"
echo "=========================================="

