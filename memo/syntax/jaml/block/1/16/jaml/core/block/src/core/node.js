import { GrammarNode } from '../../../grammar/src/core/node.js';

/**
 * ブロック要素のASTノード基底クラス。
 * 全てのブロック要素（HeadingNode, ParagraphNode等）はこのクラスを継承します。
 */
export class BlockNode extends GrammarNode {
    // 現時点では基底クラスの機能をそのまま継承します。
    // 将来的にブロック要素特有の共通プロパティやメソッドが必要になった場合、ここに実装します。
}

