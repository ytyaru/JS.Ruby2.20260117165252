import { BlockNode } from '../core/node.js';

/**
 * 見出し（Heading）のASTノードクラス。
 * 見出しレベル（1〜6）と、そのテキスト内容を保持します。
 */
export class HeadingNode extends BlockNode {
    /**
     * @param {number} level - 見出しレベル (1〜6)
     * @param {string} content - 見出しのテキスト内容
     * @param {[number, number]} location - 原稿内の絶対位置 [start, end]
     */
    constructor(level, content, location) {
        // 親クラス BlockNode のコンストラクタを呼び出し
        // type: 'heading'
        // props: { level, content }
        super('heading', location, { level, content });
    }

    /**
     * 見出しレベルを取得するゲッター
     */
    get level() {
        return this.props.level;
    }

    /**
     * 見出し内容を取得するゲッター
     */
    get content() {
        return this.props.content;
    }
}
