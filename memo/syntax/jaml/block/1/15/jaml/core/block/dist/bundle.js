// ../grammar/src/core/node.js
class GrammarNode {
  constructor(type, location, props = {}) {
    this.type = type;
    this.location = location;
    this.props = props;
    this.children = [];
  }
}

// src/core/node.js
class BlockNode extends GrammarNode {
}

// src/nodes/heading.js
class HeadingNode extends BlockNode {
  constructor(level, content, location) {
    super("heading", location, { level, content });
  }
  get level() {
    return this.props.level;
  }
  get content() {
    return this.props.content;
  }
}
// ../grammar/src/core/rule.js
class GrammarRule {
  constructor(name, pattern) {
    this.name = name;
    this.pattern = pattern;
  }
  match(text) {
    return text.match(this.pattern);
  }
}

// src/core/rule.js
class BlockRule extends GrammarRule {
}

// src/rules/heading.js
class HeadingRule extends BlockRule {
  constructor() {
    super("heading", /^(#{1,6})[ \t]+(.*)$/);
  }
}
export {
  HeadingRule,
  HeadingNode,
  BlockRule,
  BlockNode
};
