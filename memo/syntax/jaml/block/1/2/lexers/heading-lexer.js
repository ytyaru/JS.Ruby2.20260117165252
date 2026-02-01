// lexers/heading-lexer.js
import { HeadingBlock } from '../block.js';

export class HeadingBlockLexer {
    process(lexer, line, lineStart, lineEnd) {
        // Markdown仕様準拠: #の後にスペース(またはタブ)が必須
        // これにより ###Comment (スペースなし) との競合を回避する
        const match = line.match(/^(#{1,6})[ \t]+(.*)$/);
        
        if (match) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;

            const level = match[1].length;
            const content = match[2].trim();
            return new HeadingBlock(level, content, [lineStart, lineEnd]);
        }
        return null;
    }
}
