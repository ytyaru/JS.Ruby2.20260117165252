export class GrammarNode {
    /**
     * @param {string} type - ノード種別
     * @param {[number, number]} location - 位置 [start, end]
     * @param {object} props - プロパティ
     */
    constructor(type, location, props = {}) {
        this.type = type;
        this.location = location;
        this.props = props;
        this.children = [];
    }
}

