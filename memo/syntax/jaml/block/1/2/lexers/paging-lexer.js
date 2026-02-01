// lexers/paging-lexer.js
import { PagingBlock } from '../block.js';

export class PagingBlockLexer {
    process(lexer, line, lineStart, lineEnd) {
        // 引数なし、=が10個以上
        if (/^={10,}$/.test(line)) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;
            return new PagingBlock([lineStart, lineEnd]);
        }
        return null;
    }
}
