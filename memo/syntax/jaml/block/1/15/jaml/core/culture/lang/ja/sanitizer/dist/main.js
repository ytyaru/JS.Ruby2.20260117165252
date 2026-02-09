// ../../../../error/src/main.js
class JamlError extends Error {
  constructor(msg, cause) {
    super(msg, cause ? { cause } : undefined);
    this.name = "JamlError";
  }
}

// ../../../../charset/unicode/regexp/ja/src/main.js
class Category {
  constructor(items) {
    this._items = items;
    this._allCache = null;
    for (const [name, pattern] of items) {
      if (!/^[A-Z0-9_]+$/.test(name)) {
        throw new JamlError(`不適切なプロパティ名です: "${name}"。プロパティ名は最初から大文字のスネークケース（例: KANJI_ALL）で記述してください。`);
      }
      Object.defineProperty(this, name, {
        value: pattern,
        writable: false,
        enumerable: true,
        configurable: false
      });
    }
  }
  get ALL() {
    if (this._allCache === null) {
      if (this._items.length === 0) {
        this._allCache = /(?!)/u;
      } else {
        const combinedSource = this._items.map(([_, pattern]) => pattern.source).join("|");
        this._allCache = new RegExp(combinedSource, "u");
      }
    }
    return this._allCache;
  }
}
var KANA = new Category([
  ["HIRA", /[\p{Script=Hiragana}ゟ]/u],
  ["KATA", /[\p{Script=Katakana}ヿ]/u],
  ["HAN", /[\uFF66-\uFF9F]/u],
  ["HEN", /[\u{1B000}-\u{1B16F}]/u]
]);
var KANJI = new Category([
  ["CJK", /\p{Script=Han}/u],
  ["STRUCTURE", /[\u2E80-\u2FDF\u2FF0-\u2FFB]/u],
  ["KANBUN", /[\u3190-\u319F]/u]
]);
var ODORIJI = new Category([
  ["KANJI", /[々〃]/u],
  ["HIRA", /[ゝゞ]/u],
  ["KATA", /[ヽヾ]/u],
  ["VERTICAL", /[〻〱〲〳〴〵]/u]
]);
var ABBREVIATION = new Category([
  ["KANA", /[ゟヿ\u{2A708}]/u],
  ["COUNTER", /[ヶヵ]/u],
  ["SYMBOL", /[〆〼仝㍿〃]/u],
  ["ERA", /[㍾㍽㍼㍻㋿]/u],
  ["UNIT", /[\u3300-\u3370]/u]
]);
var KANSUJI = new Category([
  ["SMALL", /[〇一二三四五六七八九十百千万億兆京垓秭穣溝澗正載極]/u],
  ["LARGE", /[零壱壹弌弐貳貮弍参參弎肆泗伍陸漆質捌玖拾什佰陌阡仟萬]/u]
]);
var SEMI_KANJI = new Category([
  ["CORE", /[々〇ヶヵ〆〻〼仝\u{2A708}〃〱〲〳〴〵ゟヿ]/u]
]);
var SYMBOL = new Category([
  ["FULL", /[\u3000-\u303F！-／：-＠［-｀｛-～]/u],
  ["HALF", /[\uFF61-\uFF65]/u],
  ["VERTICAL", /[\uFE10-\uFE19\uFE30-\uFE4F]/u]
]);
var OTHER = new Category([
  ["ALPHANUMERIC", /[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]/u],
  ["COMBINING", /\p{M}/u]
]);
var JAML = new Category([
  ["RUBY_PARENT_KANJI", new RegExp(`${KANJI.CJK.source}|${SEMI_KANJI.CORE.source}`, "u")],
  ["NFC_UNSAFE", new RegExp(`${KANJI.CJK.source}|${OTHER.COMBINING.source}|${KANA.HEN.source}`, "u")]
]);
var JA_NAMESPACE = Object.freeze({
  KANA,
  KANJI,
  ODORIJI,
  ABBREVIATION,
  KANSUJI,
  SEMI_KANJI,
  SYMBOL,
  OTHER
});

// src/main.js
class JapaneseSanitizer {
  static sanitize(text, options = {}) {
    if (!text)
      return "";
    let result = text;
    if (options.structure) {
      result = this._sanitizeStructure(result, options.structure);
    }
    if (options.kanbun) {
      result = this._sanitizeKanbun(result, options.kanbun);
    }
    return result;
  }
  static _sanitizeStructure(text, mode) {
    return text;
  }
  static _sanitizeKanbun(text, mode) {
    return text;
  }
}
export {
  JapaneseSanitizer
};
