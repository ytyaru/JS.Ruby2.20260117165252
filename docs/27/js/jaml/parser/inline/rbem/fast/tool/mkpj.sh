#!/bin/bash

# スクリプトが設置されているディレクトリを基準とする
BASE_DIR=$(pwd)

# ヒアドキュメントで構造を定義
read -r -d '' STRUCTURE <<-EOF
jaml/
    protocol/
        char/
            os/
                newline.js
            uri/
                url.js
            ascii/
                space.js
                newline.js
                control.js
            unicode/
                space.js
                newline.js
                control.js
            regexp/
                space.js
                newline.js
                control.js
                cjk.js
            ja/
                all.js
                kanji.js
                odori.js
            jaml/
                block/
                    space.js
                    newline.js
                    control.js
                    meta.js
                    header/
                    paragraph/
                    fence/
                        list/
                        table/
                        tree/
                        pre-code/
                        math-ml/
                        mermaid/
                inline/
                    space.js
                    newline.js
                    control.js
                    meta.js
                    rbem/
                        space.js
                        newline.js
                        control.js
                        meta.js
        security/
            unicode/
                null-remover.js
                memo.md
            html/
                meta-sanitizer.js
    parser/
        block/
        inline/
            rbem/
                fast/
                    dist/
                    src/
                        parts/
                            html.js
                            escape.js
                            lexer.js
                        main.js
                    test/
                        parts/
                            html.js
                            escape.js
                            lexer.js
                        main.js
                lazy/
                warn/
                options/
    linter/
    viewer/
    editor/
EOF

# 構造定義を1行ずつ処理
echo "$STRUCTURE" | while IFS= read -r line || [[ -n "$line" ]]; do
    # 行頭の空白を削除
    trimmed_line=$(echo "$line" | sed 's/^[[:space:]]*//')

    # 空行はスキップ
    if [ -z "$trimmed_line" ]; then
        continue
    fi

    # パスを構築
    path="${BASE_DIR}/${trimmed_line}"

    # 末尾がスラッシュならディレクトリ、そうでなければファイルを作成
    if [[ "$trimmed_line" == */ ]]; then
        echo "Creating dir:  ${path}"
        mkdir -p "$path"
    else
        # ファイルの親ディレクトリが存在しなければ作成
        dir=$(dirname "$path")
        mkdir -p "$dir"
        echo "Creating file: ${path}"
        touch "$path"
    fi
done

echo "プロジェクト構造の生成が完了しました。"
