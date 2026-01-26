#!/usr/bin/env python3
import sys
import os

#DEFAULT_STRUCTURE_FILE = 'structure.def'
DEFAULT_STRUCTURE_FILE = 'pj-structure.txt'

def get_indent_level(line: str) -> int:
    """行のインデントレベル（スペース4つ分）を計算する"""
    return (len(line) - len(line.lstrip(' '))) // 4

def create_structure(structure_text: str):
    """構造定義テキストに基づいてディレクトリとファイルを作成する"""
    lines = structure_text.strip().split('\n')
    path_stack = ['']  # 現在のパス階層を管理するスタック

    for i, line in enumerate(lines):
        if not line.strip():
            continue

        level = get_indent_level(line)
        name = line.strip()

        # 現在の階層までスタックを調整
        while len(path_stack) > level + 1:
            path_stack.pop()

        current_path_parts = path_stack[:level + 1]
        
        # 次の行を先読みして、自分がディレクトリかどうかを判断
        is_dir = name.endswith('/')
        if not is_dir and i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.strip() and get_indent_level(next_line) > level:
                is_dir = True
        
        if is_dir:
            name = name.rstrip('/')
            full_path = os.path.join(*current_path_parts, name)
            print(f"Creating dir:  {full_path}/")
            os.makedirs(full_path, exist_ok=True)
            path_stack.append(name)
        else:
            full_path = os.path.join(*current_path_parts, name)
            # 親ディレクトリの存在を確認・作成
            parent_dir = os.path.dirname(full_path)
            if not os.path.exists(parent_dir):
                 os.makedirs(parent_dir, exist_ok=True)
            print(f"Creating file: {full_path}")
            with open(full_path, 'w') as f:
                pass # 空ファイルを作成

def main():
    """メイン処理: 入力ソースを決定し、構造を生成する"""
    structure_content = None
    
    # stdinのチェック
    if not sys.stdin.isatty():
        structure_content = sys.stdin.read()
        if sys.argv[1:]:
            print("警告: stdinを優先し、入力ファイルを無視しました。", file=sys.stderr)

    # 引数ファイルのチェック
    elif len(sys.argv) > 1:
        filepath = sys.argv[1]
        if not os.path.exists(filepath):
            print(f"エラー: 入力ファイルが存在しません: {filepath}", file=sys.stderr)
            sys.exit(1)
        with open(filepath, 'r') as f:
            structure_content = f.read()
            
    # デフォルトファイルのチェック
    else:
        if not os.path.exists(DEFAULT_STRUCTURE_FILE):
            print(f"エラー: デフォルトの構造定義ファイルが見つかりません: {DEFAULT_STRUCTURE_FILE}", file=sys.stderr)
            sys.exit(1)
        with open(DEFAULT_STRUCTURE_FILE, 'r') as f:
            structure_content = f.read()

    if structure_content:
        create_structure(structure_content)
        print("プロジェクト構造の生成が完了しました。")

if __name__ == '__main__':
    main()
