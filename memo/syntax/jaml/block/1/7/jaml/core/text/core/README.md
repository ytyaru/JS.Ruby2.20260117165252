# Jaml Core Text

テキスト処理の基底クラスを提供します。

## Usage

```javascript
import { Text } from './dist/main.js';

const raw = "Line1\r\nLine2";
const text = new Text(raw);

console.log(text.content); // "Line1\nLine2" (Normalized to LF)
console.log(text.getRowCol(6)); // [1, 0]

## Features

* **正規化**: 入力テキストの改行コードを`\n`に統一し、Unicodeサニタイズを行います。
* **: 座標計算**: : インデックスと行・列の相互変換を提供します。

