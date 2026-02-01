// lexers/hr-lexer.js
import { HrBlock } from '../block.js';

export class HrBlockLexer {
    process(lexer, line, lineStart, lineEnd) {
        // 引数なし、=が5個以上 (PagingLexerの後で実行される前提)
        if (/^={5,}$/.test(line)) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;
            return new HrBlock([lineStart, lineEnd]);
        }
        return null;
    }
}
