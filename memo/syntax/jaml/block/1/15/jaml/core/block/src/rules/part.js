import { BlockRule } from '../core/rule.js';

/**
 * 外部参照（Part）の解析ルールクラス。
 * 「part:」で始まる行を判定し、その後に続くパス文字列を抽出します。
 */
export class PartRule extends BlockRule {
    constructor() {
        /**
         * 正規表現の解説:
         * ^part:  : 行頭が "part:" で始まる
         * (.*)$   : それ以降の全文字列をキャプチャ（パスとして扱う）
         * 
         * ※コロンの後のスペースの有無は問わず、Lexer側でトリム等の処理を行う想定です。
         */
        super('part', /^part:(.*)$/);
    }
}

