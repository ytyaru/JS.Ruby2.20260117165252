import { BlockRule } from '../core/rule.js';

/**
 * 見出し（Heading）の解析ルールクラス。
 * Markdown互換の「#」記法を判定します。
 */
export class HeadingRule extends BlockRule {
    constructor() {
        /**
         * 正規表現の解説:
         * ^(#{1,6})  : 行頭から1〜6個のシャープ（レベル）
         * [ \t]+     : 1つ以上の半角スペースまたはタブ（必須）
         * (.*)$      : それ以降の全文字列（内容）
         */
        super('heading', /^(#{1,6})[ \t]+(.*)$/);
    }

    /**
     * マッチング結果から詳細な情報を抽出する（将来の拡張用）
     * 現状は基底クラスの match をそのまま使用します。
     */
}
