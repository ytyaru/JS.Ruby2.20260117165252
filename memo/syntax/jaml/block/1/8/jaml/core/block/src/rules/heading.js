import { BlockRule } from '../core/rule.js';

export class HeadingRule extends BlockRule {
    constructor() {
        // #が1-6個、その後にスペース必須
        super('heading', /^(#{1,6})[ \t]+(.*)$/);
    }
}

