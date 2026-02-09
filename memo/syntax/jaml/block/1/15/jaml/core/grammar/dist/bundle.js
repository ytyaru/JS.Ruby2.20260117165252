// src/core/node.js
class GrammarNode {
  constructor(type, location, props = {}) {
    this.type = type;
    this.location = location;
    this.props = props;
    this.children = [];
  }
}
// src/core/rule.js
class GrammarRule {
  constructor(name, pattern) {
    this.name = name;
    this.pattern = pattern;
  }
  match(text) {
    return text.match(this.pattern);
  }
}
export {
  GrammarRule,
  GrammarNode
};
