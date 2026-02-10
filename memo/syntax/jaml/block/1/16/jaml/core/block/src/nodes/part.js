import { BlockNode } from '../core/node.js';

/**
 * 外部参照（Part）のASTノードクラス。
 * 外部ファイルのパス情報を保持します。
 */
export class PartNode extends BlockNode {
    /**
     * @param {string} path - 参照する外部ファイルのパス
     * @param {[number, number]} location - 原稿内の絶対位置 [start, end]
     */
    constructor(path, location) {
        // type: 'part'
        // props: { path }
        super('part', location, { path });
    }

    /**
     * 参照パスを取得するゲッター
     */
    get path() {
        return this.props.path;
    }
}

