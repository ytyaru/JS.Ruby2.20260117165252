#!/usr/bin/env python3
import sys
import os
import re
import copy

DEFAULT_STRUCTURE_FILE = 'pj.txt'

class Node:
    def __init__(self, name, is_dir, parent=None):
        self.name = name
        self.is_dir = is_dir
        self.children = []
        self.parent = parent
        self.copy_source = None # %path% で指定されたパス文字列

    def add_child(self, node):
        node.parent = self
        self.children.append(node)
        return node

    def get_path(self):
        parts = []
        current = self
        while current and current.parent: # rootは含めない
            parts.insert(0, current.name)
        return parts

    def find_node_by_path(self, path_str):
        """パス文字列からノードを探索する (相対/絶対対応)"""
        # ルートの特定
        root = self
        while root.parent:
            root = root.parent

        # パスの分解
        if path_str.startswith('/'):
            target = root
            parts = [p for p in path_str.split('/') if p]
        else:
            target = self.parent # 兄弟を探すため、基準は親
            parts = [p for p in path_str.split('/') if p]

        for part in parts:
            if part == '.' or part == '':
                continue
            elif part == '..':
                if target.parent:
                    target = target.parent
            else:
                # 子要素から探す
                found = None
                for child in target.children:
                    if child.name == part:
                        found = child
                        break
                if found:
                    target = found
                else:
                    return None # 見つからない
        return target

def parse_line_content(line):
    """
    行からファイル名とコメントを分離する
    戻り値: (name, is_copy_instruction, copy_path)
    """
    line = line.strip()
    name = ""
    
    # シングルクォートで囲まれている場合: 'file name.txt' comment
    match_quote = re.match(r"^'([^']*)'(.*)$", line)
    if match_quote:
        name = match_quote.group(1)
        # 残りはコメントとして無視
    else:
        # スペース区切り: filename comment
        parts = line.split(None, 1)
        name = parts[0]
        # parts[1] はコメントとして無視

    # %パス% の判定
    copy_path = None
    match_copy = re.match(r"^%([^%]+)%$", name)
    if match_copy:
        copy_path = match_copy.group(1)
        name = "" # 名前は解決後に決まる、あるいは展開されるため空にしておく

    return name, copy_path

def detect_indent(lines):
    for line in lines:
        match = re.match(r'^(\s+)', line)
        if match:
            indent_str = match.group(1)
            if '\t' in indent_str: return '\t'
            if len(indent_str) >= 2: return ' ' * len(indent_str)
    return '    '

def build_tree(lines):
    """テキスト行からNodeツリーを構築する"""
    root = Node("root", True)
    indent_str = detect_indent(lines)
    
    # スタック: (level, Node)
    stack = [(-1, root)]

    for i, line in enumerate(lines):
        if not line.strip(): continue

        # インデントレベル計算
        level = 0
        while line.startswith(indent_str * (level + 1)):
            level += 1
        
        # 親を探す
        while stack[-1][0] >= level:
            stack.pop()
        parent_node = stack[-1][1]

        # 名前と属性の解析
        raw_name, copy_path = parse_line_content(line)
        
        # ディレクトリ判定
        # 1. 末尾が /
        # 2. 次の行のインデントが深い
        is_dir = False
        if copy_path:
            # コピー命令の場合はディレクトリ扱いとして仮作成し、後で解決する
            is_dir = True 
        else:
            if raw_name.endswith('/'):
                is_dir = True
                raw_name = raw_name.rstrip('/')
            
            # 先読みでディレクトリ判定
            if not is_dir and i + 1 < len(lines):
                next_line = lines[i+1]
                if next_line.strip():
                    next_level = 0
                    while next_line.startswith(indent_str * (next_level + 1)):
                        next_level += 1
                    if next_level > level:
                        is_dir = True

        # ノード作成
        node = Node(raw_name, is_dir)
        node.copy_source = copy_path
        parent_node.add_child(node)
        
        stack.append((level, node))

    return root

def resolve_copies(node):
    """再帰的に %path% を解決してツリーを展開する"""
    # 子要素をコピーして反復中に変更するため、リストをコピー
    original_children = list(node.children)
    
    for child in original_children:
        if child.copy_source:
            # 参照先を探す
            target = child.find_node_by_path(child.copy_source)
            if target:
                print(f"参照解決: %{child.copy_source}% -> {target.name}/")
                # ターゲットの子要素を全てディープコピーして、現在の親(node)に追加
                # child自体はプレースホルダーなので削除（置き換え）
                node.children.remove(child)
                
                for target_child in target.children:
                    copied_child = copy.deepcopy(target_child)
                    copied_child.parent = node
                    node.children.append(copied_child)
                    # コピーした先にも %path% があるかもしれないので再帰
                    resolve_copies(copied_child)
            else:
                print(f"エラー: 参照先が見つかりません: %{child.copy_source}%", file=sys.stderr)
        else:
            resolve_copies(child)

def create_fs(node, current_path=""):
    """ツリーに基づいてファイルシステムを生成する"""
    if node.name == "root":
        for child in node.children:
            create_fs(child, current_path)
        return

    full_path = os.path.join(current_path, node.name)

    if node.is_dir:
        print(f"dir生成:  {full_path}/")
        os.makedirs(full_path, exist_ok=True)
        for child in node.children:
            create_fs(child, full_path)
    else:
        # 親ディレクトリ作成（念のため）
        parent_dir = os.path.dirname(full_path)
        if parent_dir:
            os.makedirs(parent_dir, exist_ok=True)

        if os.path.exists(full_path):
            print(f"既存故無視: {full_path}")
        else:
            print(f"file生成: {full_path}")
            with open(full_path, 'w') as f:
                pass

def main():
    structure_content = None
    
    if not sys.stdin.isatty():
        structure_content = sys.stdin.read()
    elif len(sys.argv) > 1:
        filepath = sys.argv[1]
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                structure_content = f.read()
    else:
        if os.path.exists(DEFAULT_STRUCTURE_FILE):
            with open(DEFAULT_STRUCTURE_FILE, 'r') as f:
                structure_content = f.read()

    if not structure_content:
        print("入力がありません。ファイルパスを指定するか、標準入力、または pj.txt を用意してください。", file=sys.stderr)
        sys.exit(1)

    print("構造解析中...")
    root = build_tree(structure_content.split('\n'))
    
    print("参照展開中...")
    resolve_copies(root)
    
    print("ファイル生成中...")
    create_fs(root)
    print("完了。")

if __name__ == '__main__':
    main()

