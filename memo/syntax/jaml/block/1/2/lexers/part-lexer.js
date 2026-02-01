// lexers/part-lexer.js
import { PartBlock } from '../block.js';

export class PartBlockLexer {
    process(lexer, line, lineStart, lineEnd) {
        if (line.startsWith('part:')) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;
            const path = line.substring(5).trim();
            return new PartBlock(path, [lineStart, lineEnd]);
        }
        return null;
    }
}
