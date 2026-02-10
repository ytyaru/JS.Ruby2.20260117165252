import { BlockRule } from '../core/rule.js';

/**
 * 段落（Paragraph）の解析ルールクラス。
 * 空行以外の、他の特定のブロックルールにマッチしなかった行を判定します。
 * 基本的には空白以外の文字が1つ以上含まれる行にマッチします。
 */
export class ParagraphRule extends BlockRule {
    constructor() {
        /**
         * 正規表現の解説:
         * \S : 空白以外の文字が少なくとも1つ含まれる行にマッチ
         */
        super('paragraph', /\S/);
    }
}

