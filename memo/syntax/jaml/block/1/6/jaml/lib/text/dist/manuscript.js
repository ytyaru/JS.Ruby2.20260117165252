// src/normalizer/src/context/unicode.js
class UnicodeContext {
  static normalize(text) {
    if (!text)
      return "";
    let normalized = text.replace(/\0/g, "");
    return normalized;
  }
}

// src/normalizer/src/context/os.js
class OsContext {
  static normalize(text, newline = `
`) {
    if (!text)
      return "";
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
      const char = text[index];
      if (char === `
`) {
        currentRow++;
      }
      index++;
    }
    if (currentRow === row) {
      return Math.min(index + col, length);
    }
    return -1;
  }
  static getRowCol(text, index) {
    let row = 0;
    let col = 0;
    let i = 0;
    while (i < index && i < text.length) {
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
