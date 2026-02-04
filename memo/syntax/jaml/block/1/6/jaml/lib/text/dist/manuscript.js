// src/normalizer/src/context/unicode.js
class UnicodeContext {
  static normalize(text) {
    if (!text)
      return "";
    let normalized = text.replace(/\0/g, "");
    return normalized;
  }
}

// ../error/src/main.js
class JamlError extends Error {
  constructor(msg, cause) {
    super(msg, cause ? { cause } : undefined);
    this.name = "JamlError";
  }
}

// src/normalizer/src/context/os.js
class OsContext {
  static normalize(text, newline = `
`) {
    if (!text)
      return "";
    if (newline !== `
` && newline !== `\r
`) {
      throw new JamlError(`正規化不正。改行コードは\\nまたは\\r\\nのいずれかであるべきです。:${newline}`);
    }
    if (newline === `
`) {
      if (!text.includes("\r")) {
        return text;
      }
      return text.replace(/\r\n|\r/g, `
`);
    }
    const lfText = text.includes("\r") ? text.replace(/\r\n|\r/g, `
`) : text;
    return lfText.replace(/\n/g, newline);
  }
}

// src/normalizer/src/context/japanese.js
class JapaneseContext {
  static normalize(text) {
    if (!text)
      return "";
    return text;
  }
}

// src/normalizer/src/format/jaml.js
class JamlFormat {
  static normalize(text) {
    if (!text)
      return "";
    return text;
  }
}

// src/normalizer/src/format/html.js
class HtmlFormat {
  static normalize(text) {
    if (!text)
      return "";
    return text;
  }
}

// src/normalizer/src/main.js
class Normalizer {
  static from(data, options = {}) {
    const opts = {
      type: "jaml",
      newline: `
`,
      ja: false,
      ...options
    };
    return new Normalizer(data, opts);
  }
  constructor(data, options) {
    this._ = { data, options };
    this._normalized = null;
  }
  normalize() {
    if (this._normalized !== null) {
      return this._normalized;
    }
    let text = this._.data;
    const opts = this._.options;
    text = UnicodeContext.normalize(text);
    text = OsContext.normalize(text, opts.newline);
    if (opts.ja) {
      text = JapaneseContext.normalize(text);
    }
    switch (opts.type) {
      case "jaml":
        text = JamlFormat.normalize(text);
        break;
      case "html":
        text = HtmlFormat.normalize(text);
        break;
      default:
        break;
    }
    this._normalized = text;
    return text;
  }
}

// src/counter/src/main.js
class TextCounter {
  static count(text, options = {}) {
    if (!text)
      return 0;
    return text.length;
  }
}

// src/index/src/main.js
class TextIndex {
  static getIndex(text, row, col) {
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
  static getRowCol(text, index) {
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
}

// src/manuscript.js
class Manuscript {
  constructor(text, options = {}) {
    this._raw = text;
    this._options = options;
    this._normalized = null;
  }
  get text() {
    if (this._normalized === null) {
      const normalizer = Normalizer.from(this._raw, this._options);
      this._normalized = normalizer.normalize();
    }
    return this._normalized;
  }
  count(options = {}) {
    return TextCounter.count(this.text, options);
  }
  getRowCol(index) {
    return TextIndex.getRowCol(this.text, index);
  }
  getIndex(row, col) {
    return TextIndex.getIndex(this.text, row, col);
  }
}
export {
  Manuscript
};
