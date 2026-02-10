// ../sanitizer/src/main.js
class Sanitizer {
  static sanitize(text) {
    if (!text)
      return "";
    let sanitized = text.replace(/\0/g, "");
    return sanitized;
  }
}

// ../normalizer/src/main.js
class Normalizer {
  static normalize(text, form = "NFC") {
    if (!text)
      return "";
    return text;
  }
}

// src/main.js
class Unicode {
  static normalize(text) {
    if (!text)
      return "";
    let result = Sanitizer.sanitize(text);
    result = Normalizer.normalize(result);
    return result;
  }
}
export {
  Unicode
};
