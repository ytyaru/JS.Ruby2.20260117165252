import { GrammarRule } from '../../../grammar/src/core/rule.js';

/**
 * ブロック要素解析ルールの基底クラス。
 * 全てのブロックルール（Heading, Paragraph等）はこのクラスを継承します。
 */
export class BlockRule extends GrammarRule {
    // 現時点では基底クラスの機能をそのまま継承します。
    // 将来的にブロック要素特有の共通ロジックが必要になった場合、ここに実装します。
}

