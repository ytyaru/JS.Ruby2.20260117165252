#!/bin/bash

set -e
cd "$(dirname "$0")"

# ヘルプが要求された場合の処理
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    # ファイルパスから直接モジュールを読み込む（名前の衝突を回避）
    python3 -c "import sys, os, importlib.util; \
                path = os.path.join(os.getcwd(), 'src', 'help', 'build.py'); \
                spec = importlib.util.spec_from_file_location('build_help', path); \
                hb = importlib.util.module_from_spec(spec); \
                sys.modules['help.category'] = hb; \
                spec.loader.exec_module(hb); \
                print('\n' + hb.HELP_DESCRIPTION + '\n' + hb.HELP_EPILOG)"
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
