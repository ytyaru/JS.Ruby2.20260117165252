import { FenceRegExp } from '../../../regexp/fence.js';
import { TokenType } from '../../../token/type.js';
import { Token } from '../../../token/token.js';

export class FenceStartTokenizer {
    match(line, start, end) {
        const match = line.match(FenceRegExp.START);
        if (match) {
            const symbol = match[1];
            const args = match[2];

            // インライン競合回避: 引数に開始記号と同じ並びがあればスキップ
            if (args.includes(symbol)) {
                return null;
            }

            return new Token(TokenType.FENCE_START, [start, end], {
                symbol: symbol.charAt(0),
                length: symbol.length,
                args: args.trim()
            });
        }
        return null;
    }
}
