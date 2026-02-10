# Unicode Normalizer

Unicode文字列の正規化（Normalization Form）を扱います。

## Usage

```javascript
import { Normalizer } from './dist/main.js';

// 将来的な実装イメージ
const text = "\u304B\u3099"; // か + ゛
const normalized = Normalizer.normalize(text, 'NFC');
// Result: "\u304C" (が)
```

## Specification

### `normalize(text, form)`

`String.prototype.normalize()` のラッパーとして機能しますが、Jaml特有の問題に対処するためのものです。

#### CJK統合漢字の問題

`normalize('NFC')` を実行すると、一部のCJK統合漢字や異体字が、意図せず見た目の異なる字に変換されてしまう問題があります。（例: `神` (U+FA19) -> `神` (U+795E)）

これはJamlが扱う日本語文書において致命的な問題となりうるため、本モジュールの `normalize` メソッドは、現時点では **意図的に正規化処理を無効化** しています。

将来的に、CJK統合漢字の範囲を除外して正規化を行う、あるいはユーザーがオプションで挙動を選択できるような拡張を検討します。
