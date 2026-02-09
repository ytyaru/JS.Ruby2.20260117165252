# Japanese Sanitizer

日本語テキストにおいて、セキュリティリスク（ホモグラフ攻撃）や表示上の不具合の原因となりうる特殊な文字を検知・除去・置換します。

## 概要

本モジュールは、`JapaneseRegExp` で定義された「サニタイズ用部品」を利用し、通常の文章では使用されるべきでない文字を処理します。
主に、漢字に見せかけた部首や、レイアウトを崩す可能性のある制御記号を対象とします。

## 仕様と機能

`options` オブジェクトによって、対象カテゴリごとの挙動（除去、置換、例外送出）を制御します。

### 1. 漢字構成要素・部首のサニタイズ (Structure)
*   **対象**: `JapaneseRegExp.JA.KANJI.STRUCTURE`
    *   康煕部首 (`U+2F00`-)
    *   CJK部首補助 (`U+2E80`-)
    *   漢字構成記述文字 (`U+2FF0`-)
*   **目的**: ホモグラフ攻撃（通常の漢字と誤認させる攻撃）の防止。
*   **動作**: デフォルトでは除去、または `〓` (ゲタ) 等への置換。

### 2. 漢文用記号のサニタイズ (Kanbun)
*   **対象**: `JapaneseRegExp.JA.KANJI.KANBUN`
    *   レ点、一二三点など (`U+3190`-)
*   **目的**: 意図しない組版崩れの防止（Jamlのルビ記法等と干渉する恐れがあるため）。
*   **動作**: デフォルトでは除去。

## Usage

```javascript
import { JapaneseSanitizer } from './dist/main.js';

const text = "漢字" + "\u2FF0" + "構成文字"; // 漢字 + ⿰ + 構成文字
const options = {
    structure: 'remove', // 除去
    kanbun: 'replace'    // 置換 (デフォルト文字へ)
};

const sanitized = JapaneseSanitizer.sanitize(text, options);
// Result: "漢字構成文字"
```

