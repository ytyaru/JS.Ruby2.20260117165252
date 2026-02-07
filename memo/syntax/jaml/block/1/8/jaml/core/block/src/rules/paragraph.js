import { BlockRule } from '../core/rule.js';

export class ParagraphRule extends BlockRule {
    constructor() {
        // 空白以外の文字(\S)が少なくとも1つ含まれる行にマッチ
        super('paragraph', /\S/);
    }
}

