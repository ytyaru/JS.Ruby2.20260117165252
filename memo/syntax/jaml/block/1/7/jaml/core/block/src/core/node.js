export class BlockNode {
    /**
     * @param {string} type - ノード種別 (例: 'heading', 'paragraph')
     * @param {[number, number]} location - 原稿内の位置 [start, end]
     * @param {object} props - その他のプロパティ
     */
    constructor(type, location, props = {}) {
        this.type = type;
        this.location = location;
        this.props = props;
        this.children = []; // 子要素（インライン要素など）
    }
}

