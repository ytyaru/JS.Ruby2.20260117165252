// src/main.js
class Unicode {
  static normalize(text) {
    if (!text)
      return "";
    let normalized = text.replace(/\0/g, "");
    return normalized;
  }
}
export {
  Unicode
};
