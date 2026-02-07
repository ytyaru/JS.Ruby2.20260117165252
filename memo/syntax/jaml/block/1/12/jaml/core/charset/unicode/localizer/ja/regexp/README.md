# Japanese RegExp

日本語の文字集合に関連する正規表現を提供します。

## Usage

```javascript
import { JapaneseRegExp } from './dist/main.js';

if (JapaneseRegExp.HIRAGANA_ONLY.test("あいうえお")) {
    // is hiragana
}
```

## Note

*   `CJK_KANJI` は、Unicodeのブロック定義に基づいているため、中国語や韓国語で使われる漢字も含まれます。
*   `JAPANESE_GENERAL` は、一般的な文章で使われる文字を対象としており、全ての日本語文字を網羅しているわけではありません。

