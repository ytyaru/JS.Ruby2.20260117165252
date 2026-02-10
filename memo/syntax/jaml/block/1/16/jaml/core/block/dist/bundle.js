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
// src/nodes/paragraph.js
class ParagraphNode extends BlockNode {
  constructor(location, props = {}) {
    super("paragraph", location, props);
  }
}
// src/rules/paragraph.js
class ParagraphRule extends BlockRule {
  constructor() {
    super("paragraph", /\S/);
  }
}
// src/nodes/thematic-break.js
class ThematicBreakNode extends BlockNode {
  constructor(location, props = {}) {
    super("thematic-break", location, props);
  }
}
// src/rules/thematic-break.js
class ThematicBreakRule extends BlockRule {
  constructor() {
    super("thematic-break", /^={5,9}$/);
  }
}
// src/nodes/part.js
class PartNode extends BlockNode {
  constructor(path, location) {
    super("part", location, { path });
  }
  get path() {
    return this.props.path;
  }
}
// src/rules/part.js
class PartRule extends BlockRule {
  constructor() {
    super("part", /^part:(.*)$/);
  }
}
// src/nodes/page-break.js
class PageBreakNode extends BlockNode {
  constructor(location, props = {}) {
    super("page-break", location, props);
  }
}
// src/rules/page-break.js
class PageBreakRule extends BlockRule {
  constructor() {
    super("page-break", /^={10,}$/);
  }
}
export {
  ThematicBreakRule,
  ThematicBreakNode,
  PartRule,
  PartNode,
  ParagraphRule,
  ParagraphNode,
  PageBreakRule,
  PageBreakNode,
  HeadingRule,
  HeadingNode,
  BlockRule,
  BlockNode
};
