# Japanese Normalizer

日本語特有の表記揺れや、Unicode標準の正規化（NFC等）では解決できない日本語固有の正規化処理を提供します。

## 概要

本モジュールは、`JapaneseRegExp` で定義された文字集合を利用し、日本語文書としての整合性を高めるための変換処理を担います。
全域的な `Unicode.normalize`（NFC）がCJK統合漢字の保護のために無効化されていることを補完し、安全に正規化できる範囲（仮名など）に限定して処理を行います。

## 仕様（実装予定の機能）

### 1. 濁点・半濁点の正規化 (Dakuten Normalization)
Unicode標準の正規化では扱われない「独立した濁点記号（U+309B）」等を用いた結合を、適切な統合文字または結合文字に変換します。

*   **ケースA（統合文字への変換）**: `か` + `゛`(U+309B) → `が`(U+304C)
*   **ケースB（結合文字への置換）**: `あ` + `゛`(U+309B) → `あ` + `゙`(U+3099)
    *   統合文字が存在しない場合は、Unicode標準の結合用濁点（U+3099）に置換することで、組版上の不具合を防ぎます。

### 2. 半角・全角の正規化 (Width Normalization)
オプションに基づき、半角カタカナや半角記号を全角に統一します。

*   **対象**: `JapaneseRegExp.JA.HALFWIDTH_KATAKANA`, `JapaneseRegExp.JA.HALFWIDTH_PUNCTUATION`
*   **変換**: `ｱ` → `ア`、`｡` → `。` 等。

### 3. 漢字の保護 (Ideograph Protection)
本モジュールで行う全ての正規化処理において、`JapaneseRegExp.JAML.NFC_UNSAFE` に該当する文字（異体字を含む漢字等）は、変換の対象から除外するか、あるいは字形が変化しないことを保証します。

## Usage (イメージ)

```javascript
import { JapaneseNormalizer } from './dist/main.js';

// 濁点の正規化
const text = "か" + "\u309B"; 
const result = JapaneseNormalizer.normalize(text);
// Result: "が"
```
