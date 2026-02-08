# Jaml Core Error

Jamlプロジェクト全体で使用する共通エラークラスを提供します。

## Usage

```javascript
import { JamlError } from './dist/main.js';

try {
    throw new Error("Original Error");
} catch (e) {
    // 原因(cause)を保持してラップする
    throw new JamlError("Jaml processing failed", e);
}
```

## Features

*   **JamlError**: `Error`クラスを継承。`name`プロパティは固定で `'JamlError'`。
*   **Cause Support**: 第二引数に原因となるエラーを渡すことで、`err.cause` として保持します。

