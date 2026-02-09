// ../../error/src/main.js
class JamlError extends Error {
  constructor(msg, cause) {
    super(msg, cause ? { cause } : undefined);
    this.name = "JamlError";
  }
}

// ../../charset/unicode/sanitizer/src/main.js
class Sanitizer {
  static sanitize(text) {
    if (!text)
      return "";
    let sanitized = text.replace(/\0/g, "");
    return sanitized;
  }
}

// ../../charset/unicode/normalizer/src/main.js
class Normalizer {
  static normalize(text, form = "NFC") {
    if (!text)
      return "";
    return text;
  }
}

// ../../charset/unicode/api/src/main.js
class Unicode {
  static normalize(text) {
    if (!text)
      return "";
    let result = Sanitizer.sanitize(text);
    result = Normalizer.normalize(result);
    return result;
  }
}

// ../core/src/main.js
class Text {
  constructor(content) {
    this._raw = content || "";
    this._text = null;
  }
  get content() {
    if (this._text === null) {
      this._text = this._normalize(this._raw);
    }
    return this._text;
  }
  get raw() {
    return this._raw;
  }
  count(options = {}) {
    return this.content.length;
  }
  getRowCol(index) {
    const text = this.content;
    if (index < 0 || index > text.length) {
      throw new JamlError(`範囲外です。index:${index}`);
    }
    let row = 0;
    let col = 0;
    let i = 0;
    while (i < index) {
      if (text[i] === `
`) {
        row++;
        col = 0;
      } else {
        col++;
      }
      i++;
    }
    return [row, col];
  }
  getIndex(row, col) {
    const text = this.content;
    let currentRow = 0;
    let index = 0;
    const length = text.length;
    while (index < length && currentRow < row) {
      if (text[index] === `
`) {
        currentRow++;
      }
      index++;
    }
    if (currentRow === row) {
      const targetIndex = index + col;
      if (targetIndex <= length) {
        return targetIndex;
      }
    }
    throw new JamlError(`範囲外です。row:${row},col:${col}`);
  }
  _normalize(text) {
    let normalized = Unicode.normalize(text);
    if (!normalized.includes("\r")) {
      return normalized;
    }
    return normalized.replace(/\r\n|\r/g, `
`);
  }
}

// src/main.js
class UnitText extends Text {
}
export {
  UnitText
};
