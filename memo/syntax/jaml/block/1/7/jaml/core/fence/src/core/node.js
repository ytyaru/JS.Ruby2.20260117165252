export class FenceNode {
    constructor(type, location, props = {}) {
        this.type = type;
        this.location = location;
        this.props = props;
        this.content = []; // フェンス内部の行データ
    }
}

