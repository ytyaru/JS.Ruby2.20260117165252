# Jaml Core Block

Jamlのブロック要素（Block Elements）に関するASTノード定義、解析ルール、およびそれらの統合モジュールを提供します。

## Structure

このモジュールは、責任分離の原則に基づき、以下の3つの層で構成されています。

*   **`src/nodes/`**: ASTノードのデータ構造定義（データ）。
*   **`src/rules/`**: テキスト解析ロジック定義（ロジック）。
*   **`src/super/`**: NodeとRuleを対にしてエクスポートする統合モジュール（機能単位）。

## Supported Blocks

| ブロック名 | クラス名 (Node/Rule) | 記法例 | 説明 |
| :--- | :--- | :--- | :--- |
| **Heading** | `Heading` | `# Title` | 見出し（レベル1〜6）。 |
| **Paragraph** | `Paragraph` | `Text...` | 段落。空行以外のテキスト。 |
| **Thematic Break** | `ThematicBreak` | `=====` | 主題区切り（水平線、場面転換）。`=` が5〜9個。 |
| **Page Break** | `PageBreak` | `==========` | 改ページ。`=` が10個以上。 |
| **Part** | `Part` | `part: ./file` | 外部ファイル参照。 |

## Usage

### 一括インポート (Standard)

標準的な利用方法です。全てのブロック要素を利用できます。

```javascript
import { 
    HeadingRule, HeadingNode, 
    ParagraphRule, ParagraphNode 
} from './dist/bundle.js';
```

### 個別インポート (Lightweight)

特定のブロック機能のみが必要な場合、`super` ディレクトリから個別にインポートすることで、バンドルサイズを最小化できます。

```javascript
// 見出し機能のみ利用
import { HeadingRule, HeadingNode } from './src/super/heading.js';
```

## Development

### Build
```bash
./build.sh
```

### Test
```bash
./test.sh
```

