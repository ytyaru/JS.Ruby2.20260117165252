import { BlockNode } from '../core/node.js';

/**
 * 改ページ（Page Break）のASTノードクラス。
 * 物理的なページの区切り位置を保持します。
 */
export class PageBreakNode extends BlockNode {
    /**
     * @param {[number, number]} location - 原稿内の絶対位置 [start, end]
     * @param {object} props - 追加プロパティ（将来用）
     */
    constructor(location, props = {}) {
        // type: 'page-break'
        super('page-break', location, props);
    }
}

