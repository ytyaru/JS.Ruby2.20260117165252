#!/usr/bin/env python3
import sys
import os
import re
import copy
import stat

DEFAULT_STRUCTURE_FILE = 'pj.txt'

class Node:
    def __init__(self, name, is_dir, parent=None):
        self.name = name
        self.is_dir = is_dir
        self.children = []
        self.parent = parent
        self.copy_source = None # %path% 用
        self.is_template_ref = False # /# 用
        self.mode = None # パーミッション (例: 0o755)

    def add_child(self, node):
        node.parent = self
        self.children.append(node)
        return node

    def find_node_by_path(self, path_str):
        """パス文字列からノードを探索する"""
        root = self
        while root.parent:
            root = root.parent

        if path_str.startswith('/'):
            target = root
            parts = [p for p in path_str.split('/') if p]
        else:
            target = self.parent
            parts = [p for p in path_str.split('/') if p]

        for part in parts:
            if part == '.' or part == '': continue
            elif part == '..':
                if target.parent: target = target.parent
            else:
                found = None
                for child in target.children:
                    if child.name == part:
                        found = child
                        break
                if found: target = found
                else: return None
        return target

def parse_line_attributes(line):
    """行から名前、属性(+x)、コメントを分離する"""
    line = line.split('#')[0].strip() # コメント除去（行末の # 以降）
    if not line: return None, None, False, False

    mode = None
    is_template_ref = False
    
    # テンプレート参照判定 (末尾が /#)
    if line.endswith('/#'):
        is_template_ref = True
        line = line[:-2] # /# を削除

    # 実行権限判定 (+x)
    if line.endswith('+x'):
        mode = 0o755
        line = line[:-2].strip()

    # クォート処理
    name = ""
    match_quote = re.match(r"^'([^']*)'$", line)
    if match_quote:
        name = match_quote.group(1)
    else:
        name = line

    # %パス% 判定
    copy_path = None
    match_copy = re.match(r"^%([^%]+)%$", name)
    if match_copy:
        copy_path = match_copy.group(1)
        name = ""

    return name, mode, is_template_ref, copy_path

def detect_indent(lines):
    for line in lines:
        if not line.strip(): continue
        match = re.match(r'^(\s+)', line)
        if match:
            indent_str = match.group(1)
            if '\t' in indent_str: return '\t'
            if len(indent_str) >= 2: return ' ' * len(indent_str)
    return '    '

def parse_structure(lines, root_node=None, template_node=None):
    """テキスト行からツリーを構築する"""
    if root_node is None:
        root_node = Node("root", True)
    
    indent_str = detect_indent(lines)
    stack = [(-1, root_node)]

    for i, line in enumerate(lines):
        if not line.strip(): continue

        level = 0
        while line.startswith(indent_str * (level + 1)):
            level += 1
        
        while stack[-1][0] >= level:
            stack.pop()
        parent_node = stack[-1][1]

        name, mode, is_template_ref, copy_path = parse_line_attributes(line)
        
        # ディレクトリ判定
        is_dir = False
        if is_template_ref or copy_path:
            is_dir = True
        elif name.endswith('/'):
            is_dir = True
            name = name.rstrip('/')
        elif i + 1 < len(lines):
            next_line = lines[i+1]
            if next_line.strip():
                next_level = 0
                while next_line.startswith(indent_str * (next_level + 1)):
                    next_level += 1
                if next_level > level:
                    is_dir = True

        node = Node(name, is_dir)
        node.mode = mode
        node.copy_source = copy_path
        
        # テンプレート適用のロジック
        if is_template_ref and template_node:
            # テンプレートの子要素をディープコピーして追加
            for tmpl_child in template_node.children:
                copied_child = copy.deepcopy(tmpl_child)
                node.add_child(copied_child)
                # 親リンクの修正は add_child で行われるが、
                # 再帰的な子要素の親リンクは deepcopy で維持されるため問題ない
                # ただし、deepcopy直後の親は元の親を指している可能性があるため、
                # add_child 内で node.parent = self しているのが重要。
                # 再帰的に親を付け替える必要があるか？ -> add_childは直下のみ。
                # deepcopyなら構造は保たれる。
                _fix_parents(copied_child, node)

        parent_node.add_child(node)
        stack.append((level, node))

    return root_node

def _fix_parents(node, parent):
    node.parent = parent
    for child in node.children:
        _fix_parents(child, node)

def resolve_copies(node):
    """%path% の解決"""
    original_children = list(node.children)
    for child in original_children:
        if child.copy_source:
            target = child.find_node_by_path(child.copy_source)
            if target:
                print(f"参照解決: %{child.copy_source}% -> {target.name}/")
                node.children.remove(child)
                for target_child in target.children:
                    copied_child = copy.deepcopy(target_child)
                    node.add_child(copied_child)
                    _fix_parents(copied_child, node)
                    resolve_copies(copied_child)
            else:
                print(f"エラー: 参照先が見つかりません: %{child.copy_source}%", file=sys.stderr)
        else:
            resolve_copies(child)

def create_fs(node, current_path=""):
    if node.name == "root":
        for child in node.children:
            create_fs(child, current_path)
        return

    full_path = os.path.join(current_path, node.name)

    if node.is_dir:
        if not os.path.exists(full_path):
            print(f"dir生成:  {full_path}/")
            os.makedirs(full_path, exist_ok=True)
        for child in node.children:
            create_fs(child, full_path)
    else:
        parent_dir = os.path.dirname(full_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)

        if not os.path.exists(full_path):
            print(f"file生成: {full_path}")
            with open(full_path, 'w') as f:
                pass
            
        # 権限設定 (既存ファイルでも適用する)
        if node.mode:
            current_mode = os.stat(full_path).st_mode
            if (current_mode & 0o777) != node.mode:
                print(f"chmod: {full_path} -> {oct(node.mode)}")
                os.chmod(full_path, node.mode)

def main():
    content = ""
    if not sys.stdin.isatty():
        content = sys.stdin.read()
    elif len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], 'r') as f: content = f.read()
    elif os.path.exists(DEFAULT_STRUCTURE_FILE):
        with open(DEFAULT_STRUCTURE_FILE, 'r') as f: content = f.read()
    else:
        print("入力がありません。", file=sys.stderr)
        sys.exit(1)

    # テンプレートと本体の分離
    parts = content.split('\n---\n')
    
    template_root = None
    project_lines = []

    if len(parts) >= 2:
        # テンプレートあり
        print("テンプレート定義を検出しました。")
        template_lines = parts[0].strip().split('\n')
        template_root = parse_structure(template_lines)
        project_lines = parts[1].strip().split('\n')
    else:
        # テンプレートなし
        project_lines = parts[0].strip().split('\n')

    print("構造解析中...")
    root = parse_structure(project_lines, template_node=template_root)
    
    print("参照展開中...")
    resolve_copies(root)
    
    print("ファイル生成中...")
    create_fs(root)
    print("完了。")

if __name__ == '__main__':
    main()

