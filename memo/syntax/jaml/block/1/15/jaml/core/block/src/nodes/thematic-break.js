import { BlockNode } from '../core/node.js';

/**
 * 主題区切り（Thematic Break）のASTノードクラス。
 * 文脈の転換点（水平線や場面転換記号など）を保持します。
 */
export class ThematicBreakNode extends BlockNode {
    /**
     * @param {[number, number]} location - 原稿内の絶対位置 [start, end]
     * @param {object} props - 追加プロパティ（将来用：区切り線の種類や記号など）
     */
    constructor(location, props = {}) {
        // type: 'thematic-break'
        super('thematic-break', location, props);
    }
}

