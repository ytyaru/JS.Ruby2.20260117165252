#!/bin/bash

# エラーが発生した時点でスクリプトを終了させる
set -e

# スクリプトの場所を基準にカレントディレクトリを移動
cd "$(dirname "$0")"

# ヘルプが要求された場合の処理
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    # カレントディレクトリをsys.pathに追加してhelpディレクトリを認識させる
    python3 -c "import sys, os; sys.path.insert(0, os.getcwd()); \
                from help.build import HELP_DESCRIPTION, HELP_EPILOG; \
                print('\n' + HELP_DESCRIPTION + '\n' + HELP_EPILOG)"
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

