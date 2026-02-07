// src/core/node.js
class FenceNode {
  constructor(type, location, props = {}) {
    this.type = type;
    this.location = location;
    this.props = props;
    this.content = [];
  }
}
export {
  FenceNode
};
