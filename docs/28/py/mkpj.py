#!/usr/bin/env python3
import sys
import os
import re

#DEFAULT_STRUCTURE_FILE = 'structure.def'
DEFAULT_STRUCTURE_FILE = 'pj-structure.txt'

def detect_indent(lines: list[str]) -> str:
    """テキストからインデント文字列（タブまたはスペース）を自動検出する"""
    for line in lines:
        match = re.match(r'^(\s+)', line)
        if match:
            indent_str = match.group(1)
            if '\t' in indent_str:
                return '\t'
            if len(indent_str) >= 2:
                return ' ' * len(indent_str)
    return '    ' # デフォルトはスペース4つ

def get_indent_level(line: str, indent_str: str) -> int:
    """行のインデントレベルを計算する"""
    level = 0
    while line.startswith(indent_str * (level + 1)):
        level += 1
    return level

def create_structure(structure_text: str):
    """構造定義テキストに基づいてディレクトリとファイルを作成する"""
    lines = structure_text.strip().split('\n')
    indent_str = detect_indent(lines)
    
    path_stack = ['']
    last_level = -1

    for i, line in enumerate(lines):
        line_num = i + 1
        
        if not line.strip():
            continue # 空行はスキップ

        level = get_indent_level(line, indent_str)
        name = line.strip()

        # インデントが不正（多段飛ばし）な場合はエラー
        if level > last_level + 1:
            print(f"エラー (行 {line_num}): インデントが不正です。階層を飛ばすことはできません。", file=sys.stderr)
            sys.exit(1)

        while len(path_stack) > level + 1:
            path_stack.pop()

        current_path_parts = path_stack[:level + 1]
        
        is_dir = name.endswith('/')
        if not is_dir and i + 1 < len(lines):
            next_line = lines[i + 1]
            if next_line.strip() and get_indent_level(next_line, indent_str) > level:
                is_dir = True
        
        if is_dir:
            name = name.rstrip('/')
            full_path = os.path.join(*current_path_parts, name)
            print(f"Creating dir:  {full_path}/")
            os.makedirs(full_path, exist_ok=True)
            path_stack.append(name)
        else:
            full_path = os.path.join(*current_path_parts, name)
            parent_dir = os.path.dirname(full_path)
            
            # 親パスが空文字列になるケースをガード
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
                
            print(f"Creating file: {full_path}")
            with open(full_path, 'w') as f:
                pass
        
        last_level = level

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

