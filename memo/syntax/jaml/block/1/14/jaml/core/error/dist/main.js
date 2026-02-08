// src/main.js
class JamlError extends Error {
  constructor(msg, cause) {
    super(msg, cause ? { cause } : undefined);
    this.name = "JamlError";
  }
}
export {
  JamlError
};
