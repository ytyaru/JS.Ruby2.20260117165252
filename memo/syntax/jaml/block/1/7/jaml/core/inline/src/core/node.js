export class InlineNode {
    constructor(type, location, props = {}) {
        this.type = type;
        this.location = location;
        this.props = props;
        this.children = [];
    }
}

