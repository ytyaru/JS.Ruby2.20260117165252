import { BlockNode } from '../core/node.js';

/**
 * 段落（Paragraph）のASTノードクラス。
 * 連続するテキスト行を一つの塊として保持します。
 */
export class ParagraphNode extends BlockNode {
    /**
     * @param {[number, number]} location - 原稿内の絶対位置 [start, end]
     * @param {object} props - 追加プロパティ（将来用）
     */
    constructor(location, props = {}) {
        // type: 'paragraph'
        // 段落は通常、中身を children (InlineNode) として持つため、
        // props に特定のデータを持たせる必要性は現時点では低いです。
        super('paragraph', location, props);
    }
}

