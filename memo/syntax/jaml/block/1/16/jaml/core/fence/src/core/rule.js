import { GrammarRule } from '../../../grammar/src/core/rule.js';

export class FenceRule extends GrammarRule {
    /**
     * @override
     */
    match(line) {
        const match = super.match(line);
        if (!match) return null;

        // Group 1: 記号列 (例: "```")
        // Group 2: 引数 (例: "js")
        const symbol = match[1];
        const args = match[2];

        // 【競合回避ロジック】
        // 引数部分に開始記号と同じ並びが含まれていれば、
        // それはフェンス開始ではなくインラインコード（またはその閉じ）とみなす。
        if (args && args.includes(symbol)) {
            return null;
        }

        return match;
    }
}

