import { BlockRule } from '../core/rule.js';

export class PartRule extends BlockRule {
    constructor() {
        // part: の後に任意の文字列（パス）が続く、または改行のみ
        // ※複数行の取り込みはLexerの責務になるため、ここでは「開始行」のマッチングを行う
        // コロンの後にスペースは必須としない
        super('part', /^part:(.*)$/);
    }
}

