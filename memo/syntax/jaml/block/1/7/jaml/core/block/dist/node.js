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
export {
  BlockNode
};
