# Jaml Core Grammar

Jamlの構文解析における「ルール」と「ASTノード」の基底クラス、およびそれらを管理するレジストリを提供します。

## Structure

*   **src/core/**: 基底クラス定義 (`GrammarNode`, `GrammarRule`)
*   **src/main.js**: モジュールエントリポイント
*   **src/presets/**: (予定) 標準的な文法定義セット

## Usage

```javascript
import { GrammarRule } from './dist/main.js';

class MyRule extends GrammarRule {
    constructor() {
        super('my-rule', /^my-rule/);
    }
}
```

