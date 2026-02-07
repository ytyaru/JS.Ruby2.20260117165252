import { FenceRule } from '../core/rule.js';

export class QuoteRule extends FenceRule {
    constructor() {
        super('quote', /^("{3,})(.*)$/);
    }

    /**
     * @override
     */
    match(line) {
        const match = super.match(line);
        if (!match) return null;

        const symbol = match[1];
        const args = match[2];

        // 引用符でも同様に、行内に閉じ記号がある場合はインライン扱いとする
        if (args.includes(symbol)) {
            return null;
        }

        return match;
    }
}

