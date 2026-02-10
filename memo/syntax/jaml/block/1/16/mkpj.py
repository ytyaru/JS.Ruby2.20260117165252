#!/usr/bin/env python3
import sys
import os
import re
import copy
import argparse
import stat

DEFAULT_STRUCTURE_FILE = 'pj.txt'

# --- 1. Data Structure ---

class Node:
    def __init__(self, name, is_dir, parent=None):
        self.name = name
        self.is_dir = is_dir
        self.children = []
        self.parent = parent
        self.mode = None
        self.copy_source = None
        self.apply_template = False
        self.is_explicit_empty = False

    def add_child(self, node):
        node.parent = self
        self.children.append(node)
        return node

    def has_children(self):
        return len(self.children) > 0

    def find_node_by_path(self, path_str):
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

# --- 2. Parsing Logic ---

class AttributeParser:
    def __init__(self, implicit_template_mode=True):
        self.implicit_template_mode = implicit_template_mode

    def parse_line(self, line):
        line = line.split('#')[0].strip()
        if not line: return None
        if line == '---': return None

        mode = None
        apply_template = False
        is_explicit_empty = False
        
        if line.endswith('+x'):
            mode = 0o755
            line = line[:-2].strip()

        if line.endswith('/0'):
            is_explicit_empty = True
            line = line[:-2].strip()

        if line.endswith('/#'):
            apply_template = True
            line = line[:-2].strip()

        name = ""
        match_quote = re.match(r"^'([^']*)'(.*)$", line)
        if match_quote:
            name = match_quote.group(1)
            rest = match_quote.group(2)
            if rest.strip().startswith('/'):
                name += '/'
        else:
            parts = line.split(None, 1)
            name = parts[0]

        copy_source = None
        match_copy = re.match(r"^%([^%]+)%$", name)
        if match_copy:
            copy_source = match_copy.group(1)
            name = ""

        is_dir = False
        if name.endswith('/') or is_explicit_empty or apply_template or copy_source:
            is_dir = True
            name = name.rstrip('/')

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
            if line.strip() == '---': continue
            match = re.match(r'^(\s+)', line)
            if match:
                indent_str = match.group(1)
                if '\t' in indent_str: return '\t'
                if len(indent_str) >= 2: return ' ' * len(indent_str)
        return '    '

    def build(self, lines, root_name="root"):
        root = Node(root_name, True)
        indent_str = self.detect_indent(lines)
        stack = [(-1, root)]

        for i, line in enumerate(lines):
            if not line.strip(): continue

            level = 0
            while line.startswith(indent_str * (level + 1)):
                level += 1
            
            while stack[-1][0] >= level:
                stack.pop()
            parent_node = stack[-1][1]

            attrs = self.parser.parse_line(line)
            if not attrs: continue

            if not attrs['is_dir'] and i + 1 < len(lines):
                next_line = lines[i+1]
                if next_line.strip() and next_line.strip() != '---':
                    next_level = 0
                    while next_line.startswith(indent_str * (next_level + 1)):
                        next_level += 1
                    if next_level > level:
                        attrs['is_dir'] = True

            node = Node(attrs['name'], attrs['is_dir'])
            node.mode = attrs['mode']
            node.copy_source = attrs['copy_source']
            node.apply_template = attrs['apply_template']
            node.is_explicit_empty = attrs['is_explicit_empty']

            parent_node.add_child(node)
            stack.append((level, node))

        return root

# --- 3. Template & Reference Expansion ---

class TemplateExpander:
    def __init__(self, template_root):
        self.template_root = template_root

    def _fix_parents(self, node, parent):
        node.parent = parent
        for child in node.children:
            self._fix_parents(child, node)

    def expand(self, node):
        # 1. テンプレート適用
        if node.apply_template and not node.has_children() and self.template_root:
            for tmpl_child in self.template_root.children:
                copied_child = copy.deepcopy(tmpl_child)
                node.add_child(copied_child)
                self._fix_parents(copied_child, node)
            node.apply_template = False

        # 2. 参照解決 (現在の階層の参照を全て解決するまでループ)
        # これにより、兄弟要素が全て揃ってから子階層へ進むことが保証される
        while True:
            reference_found = False
            current_children = list(node.children)
            
            for child in current_children:
                if child.copy_source:
                    reference_found = True
                    target = child.find_node_by_path(child.copy_source)
                    if target:
                        print(f"参照解決: %{child.copy_source}% -> {target.name}/")
                        node.children.remove(child)
                        
                        for target_child in target.children:
                            copied_child = copy.deepcopy(target_child)
                            node.add_child(copied_child)
                            self._fix_parents(copied_child, node)
                    else:
                        print(f"エラー: 参照先が見つかりません: %{child.copy_source}%", file=sys.stderr)
                        # 無限ループ防止のため削除
                        node.children.remove(child)
            
            if not reference_found:
                break

        # 3. 再帰処理 (子階層へ)
        for child in node.children:
            self.expand(child)

# --- 4. File System Operations ---

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
            
            if node.mode:
                current_mode = os.stat(full_path).st_mode
                if (current_mode & 0o777) != node.mode:
                    print(f"chmod: {full_path} -> {oct(node.mode)}")
                    os.chmod(full_path, node.mode)

# --- 5. Main ---

def parse_input_content(content):
    lines = content.split('\n')
    if not lines: return [], []

    first_line = lines[0].strip()
    
    if first_line == '---':
        template_lines = []
        project_lines = []
        separator_found = False
        
        for i, line in enumerate(lines[1:], start=1):
            if line.strip() == '---':
                separator_found = True
                project_lines = lines[i+1:]
                break
            template_lines.append(line)
        
        if not separator_found:
            print("エラー: テンプレート定義の終了を示す '---' が見つかりません。", file=sys.stderr)
            sys.exit(1)
            
        return template_lines, project_lines
    else:
        return [], lines

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('file', nargs='?', default=DEFAULT_STRUCTURE_FILE)
    parser.add_argument('--mode', choices=['implicit', 'explicit'], default='implicit')
    args = parser.parse_args()

    content = ""
    if not sys.stdin.isatty() and args.file == DEFAULT_STRUCTURE_FILE:
        content = sys.stdin.read()
    elif os.path.exists(args.file):
        with open(args.file, 'r') as f: content = f.read()
    else:
        print(f"エラー: 入力ファイルが見つかりません: {args.file}", file=sys.stderr)
        sys.exit(1)

    template_lines, project_lines = parse_input_content(content)

    if template_lines:
        print("テンプレート定義を検出しました。")

    attr_parser = AttributeParser(implicit_template_mode=(args.mode == 'implicit'))
    builder = TreeBuilder(attr_parser)
    
    print("構造解析中...")
    template_root = builder.build(template_lines, "template_root") if template_lines else None
    project_root = builder.build(project_lines, "root")

    print("テンプレートと参照を展開中...")
    expander = TemplateExpander(template_root)
    expander.expand(project_root)

    print("ファイル生成中...")
    writer = FileSystemWriter()
    writer.write(project_root)
    print("完了。")

if __name__ == '__main__':
    main()
