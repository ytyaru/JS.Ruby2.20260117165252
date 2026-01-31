#!/bin/bash

# ヘルプが要求された場合、外部の総合ヘルプ定義を使用して表示し終了する
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    python3 -c "from help_config_main import MAIN_HELP_DESCRIPTION, MAIN_HELP_EPILOG; \
                print('\n' + MAIN_HELP_DESCRIPTION + '\n' + MAIN_HELP_EPILOG)"
    exit 0
fi

echo "--- Step 1: 由来別の分類実行 (categorize-source.py) ---"
./categorize-source.py

echo -e "\n--- Step 2: フィルタリングとマージ実行 (marge-source.py) ---"
# すべての引数 ($@) をマージスクリプトに渡す
./marge-source.py "$@"

if [ $? -eq 0 ]; then
    echo -e "\n--- Step 3: JSコード生成実行 (generate-js.py) ---"
    ./generate-js.py merge.tsv
    echo -e "\n工程がすべて完了しました。出力先: invisible-chars.js"
else
    echo -e "\nエラー: マージ工程で失敗したため、JS生成を中断しました。"
    exit 1
fi

