// src/core/node.js
class InlineNode {
  constructor(type, location, props = {}) {
    this.type = type;
    this.location = location;
    this.props = props;
    this.children = [];
  }
}
export {
  InlineNode
};
