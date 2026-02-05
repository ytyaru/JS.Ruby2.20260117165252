# Jaml Core Charset Unicode

Unicode文字列の正規化およびサニタイズ機能を提供します。

## Usage

```javascript
import { Unicode } from './dist/main.js';

const text = "Hello\0World";
const normalized = Unicode.normalize(text);
// Result: "HelloWorld" (Null byte removed)
```

## Specification

### `normalize(text)`

1.  **サニタイズ**: ヌルバイト (`\0`) を削除します（ヌルバイト攻撃対策）。
2.  **正規化**:
    *   **現状**: `String.prototype.normalize('NFC')` は **無効化** されています。
    *   **理由**: CJK統合漢字において、異体字（例: 神 -> 神）が意図せず変換されるのを防ぐためです。
    *   **セキュリティ**: ホモグラフ攻撃等の高度なチェックは、パフォーマンスへの影響が甚大であるため、本モジュールでは行いません。

