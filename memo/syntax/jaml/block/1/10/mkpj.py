#!/usr/bin/env python3
import sys
import os
import re
import copy
import argparse
import stat

DEFAULT_STRUCTURE_FILE = 'pj.txt'

# --- 1. データ構造 ---

class Node:
    def __init__(self, name, is_dir, parent=None):
        self.name = name
        self.is_dir = is_dir
        self.children = []
        self.parent = parent
        self.mode = None        # パーミッション (例: 0o755)
        self.copy_source = None # %path% 参照用
        self.apply_template = False # テンプレート適用フラグ
        self.is_explicit_empty = False # /0 (空ディレクトリ明示) フラグ

    def add_child(self, node):
        node.parent = self
        self.children.append(node)
        return node

    def has_children(self):
        return len(self.children) > 0

    def find_node_by_path(self, path_str):
        """相対パスまたは絶対パスからノードを探索する"""
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

# --- 2. 解析ロジック ---

class AttributeParser:
    def __init__(self, implicit_template_mode=True):
        self.implicit_template_mode = implicit_template_mode

    def parse_line(self, line):
        """
        1行を解析して属性を抽出する
        戻り値: 辞書型 {name, is_dir, mode, ...}
        """
        # 1. #コメントの除去（行末の # 以降を削除）
        line = line.split('#')[0].strip()
        if not line: return None

        mode = None
        apply_template = False
        is_explicit_empty = False
        
        # 2. 末尾属性の判定と除去
        # 順序重要: パス名の一部と誤認しないように末尾からチェック

        # +x (実行権限)
        if line.endswith('+x'):
            mode = 0o755
            line = line[:-2].strip()

        # /0 (空ディレクトリ明示)
        if line.endswith('/0'):
            is_explicit_empty = True
            line = line[:-2].strip() # /0 を削除

        # /# (テンプレート適用明示 - explicitモード用)
        if line.endswith('/#'):
            apply_template = True
            line = line[:-2].strip()

        # 3. 名前とコメント（スペース区切り）の分離
        name = ""
        
        # クォート判定: 'file name.txt' comment
        match_quote = re.match(r"^'([^']*)'(.*)$", line)
        if match_quote:
            name = match_quote.group(1)
            rest = match_quote.group(2)
            # クォートの後ろに / があればディレクトリマーカーとみなす
            if rest.strip().startswith('/'):
                name += '/' 
        else:
            # スペース区切り: filename comment
            # 最初の空白までを名前とする
            parts = line.split(None, 1)
            name = parts[0]
            # parts[1] はコメントとして無視される

        # 4. %パス% 判定
        copy_source = None
        match_copy = re.match(r"^%([^%]+)%$", name)
        if match_copy:
            copy_source = match_copy.group(1)
            name = "" # 名前は参照先から決定されるため空にする

        # 5. ディレクトリ判定
        is_dir = False
        if name.endswith('/') or is_explicit_empty or apply_template or copy_source:
            is_dir = True
            name = name.rstrip('/')

        # 6. 暗黙的テンプレート適用判定
        # ディレクトリであり、空明示(/0)がなく、参照コピーでもなく、既に適用フラグがない場合
        if self.implicit_template_mode and is_dir and not is_explicit_empty and not copy_source and not apply_template:
            apply_template = True

        return {
            'name': name,
            'is_dir': is_dir,
            'mode': mode,
            'copy_source': copy_source,
            'apply_template': apply_template,
            'is_explicit_empty': is_explicit_empty
        }

class TreeBuilder:
    def __init__(self, parser):
        self.parser = parser

    def detect_indent(self, lines):
        for line in lines:
            if not line.strip(): continue
            match = re.match(r'^(\s+)', line)
            if match:
                indent_str = match.group(1)
                if '\t' in indent_str: return '\t'
                if len(indent_str) >= 2: return ' ' * len(indent_str)
        return '    ' # デフォルト

    def build(self, lines, root_name="root"):
        root = Node(root_name, True)
        indent_str = self.detect_indent(lines)
        stack = [(-1, root)]

        for i, line in enumerate(lines):
            if not line.strip(): continue

            # インデントレベル計算
            level = 0
            while line.startswith(indent_str * (level + 1)):
                level += 1
            
            # 親ノードを探す
            while stack[-1][0] >= level:
                stack.pop()
            parent_node = stack[-1][1]

            # 属性解析
            attrs = self.parser.parse_line(line)
            if not attrs: continue

            # 文脈によるディレクトリ判定 (先読み)
            # 現在行がディレクトリ指定でなくとも、次行のインデントが深ければディレクトリとみなす
            if not attrs['is_dir'] and i + 1 < len(lines):
                next_line = lines[i+1]
                if next_line.strip():
                    next_level = 0
                    while next_line.startswith(indent_str * (next_level + 1)):
                        next_level += 1
                    if next_level > level:
                        attrs['is_dir'] = True

            # ノード生成
            node = Node(attrs['name'], attrs['is_dir'])
            node.mode = attrs['mode']
            node.copy_source = attrs['copy_source']
            node.apply_template = attrs['apply_template']
            node.is_explicit_empty = attrs['is_explicit_empty']

            parent_node.add_child(node)
            stack.append((level, node))

        return root

# --- 3. テンプレート展開と参照解決 ---

class TemplateExpander:
    def __init__(self, template_root):
        self.template_root = template_root

    def _fix_parents(self, node, parent):
        node.parent = parent
        for child in node.children:
            self._fix_parents(child, node)

    def expand(self, node):
        """再帰的にテンプレートと参照を展開する"""
        
        # 1. テンプレート適用
        # 条件: テンプレート適用フラグがあり、子要素が定義されておらず、テンプレートが存在する
        if node.apply_template and not node.has_children() and self.template_root:
            for tmpl_child in self.template_root.children:
                copied_child = copy.deepcopy(tmpl_child)
                node.add_child(copied_child)
                self._fix_parents(copied_child, node)
            
            node.apply_template = False # 適用済み

        # 2. 参照解決 (%path%)
        # リストを変更するためコピーで回す
        original_children = list(node.children)
        for child in original_children:
            if child.copy_source:
                target = child.find_node_by_path(child.copy_source)
                if target:
                    print(f"参照解決: %{child.copy_source}% -> {target.name}/")
                    node.children.remove(child)
                    
                    # ターゲットの子要素をコピーして追加
                    for target_child in target.children:
                        copied_child = copy.deepcopy(target_child)
                        node.add_child(copied_child)
                        self._fix_parents(copied_child, node)
                        
                        # コピー先にも参照が含まれる可能性があるため再帰
                        self.expand(copied_child)
                else:
                    print(f"エラー: 参照先が見つかりません: %{child.copy_source}%", file=sys.stderr)
            else:
                # 通常の子要素も再帰的に展開
                self.expand(child)

# --- 4. ファイルシステム操作 ---

class FileSystemWriter:
    def write(self, node, current_path=""):
        if node.name == "root":
            for child in node.children:
                self.write(child, current_path)
            return

        full_path = os.path.join(current_path, node.name)

        if node.is_dir:
            if not os.path.exists(full_path):
                print(f"dir生成:  {full_path}/")
                os.makedirs(full_path, exist_ok=True)
            
            for child in node.children:
                self.write(child, full_path)
        else:
            parent_dir = os.path.dirname(full_path)
            if parent_dir and not os.path.exists(parent_dir):
                os.makedirs(parent_dir, exist_ok=True)

            if not os.path.exists(full_path):
                print(f"file生成: {full_path}")
                with open(full_path, 'w') as f:
                    pass
            
            # 権限設定 (既存ファイルでも適用)
            if node.mode:
                current_mode = os.stat(full_path).st_mode
                if (current_mode & 0o777) != node.mode:
                    print(f"chmod: {full_path} -> {oct(node.mode)}")
                    os.chmod(full_path, node.mode)

# --- 5. メイン処理 ---

def main():
    parser = argparse.ArgumentParser(description='テキストファイルからプロジェクト構造を生成します。')
    parser.add_argument('file', nargs='?', default=DEFAULT_STRUCTURE_FILE, help='構造定義ファイル')
    parser.add_argument('--mode', choices=['implicit', 'explicit'], default='implicit', 
                        help='テンプレート適用モード。"implicit"(デフォルト)は末端ディレクトリに自動適用。"explicit"は /# が必要。')
    
    args = parser.parse_args()

    # 入力読み込み
    content = ""
    if not sys.stdin.isatty() and args.file == DEFAULT_STRUCTURE_FILE:
        content = sys.stdin.read()
    elif os.path.exists(args.file):
        with open(args.file, 'r') as f: content = f.read()
    else:
        print(f"エラー: 入力ファイルが見つかりません: {args.file}", file=sys.stderr)
        sys.exit(1)

    # テンプレートと本体の分離
    parts = content.split('\n---\n')
    template_lines = []
    project_lines = []

    if len(parts) >= 2:
        print("テンプレート定義を検出しました。")
        template_lines = parts[0].strip().split('\n')
        project_lines = parts[1].strip().split('\n')
    else:
        project_lines = parts[0].strip().split('\n')

    # コンポーネント初期化
    attr_parser = AttributeParser(implicit_template_mode=(args.mode == 'implicit'))
    builder = TreeBuilder(attr_parser)
    
    # ツリー構築
    print("構造解析中...")
    template_root = builder.build(template_lines, "template_root") if template_lines else None
    project_root = builder.build(project_lines, "root")

    # 展開
    print("テンプレートと参照を展開中...")
    expander = TemplateExpander(template_root)
    expander.expand(project_root)

    # 書き込み
    print("ファイル生成中...")
    writer = FileSystemWriter()
    writer.write(project_root)
    print("完了。")

if __name__ == '__main__':
    main()

