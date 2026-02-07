import { FenceRule } from '../core/rule.js';

export class BackquoteRule extends FenceRule {
    constructor() {
        // Group 1: 記号列 (`{3,})
        // Group 2: 引数 (.*)
        super('backquote', /^(`{3,})(.*)$/);
    }

    /**
     * @override
     */
    match(line) {
        const match = super.match(line);
        if (!match) return null;

        const symbol = match[1]; // 例: "```"
        const args = match[2];   // 例: "js" または " `code` "

        // 【競合回避ロジック】
        // 引数部分に開始記号と同じ並びが含まれていれば、
        // それはフェンス開始ではなくインラインコード（またはその閉じ）とみなす。
        // 例: ``` `code` ``` -> null (Paragraphとして処理されるべき)
        if (args.includes(symbol)) {
            return null;
        }

        return match;
    }
}

