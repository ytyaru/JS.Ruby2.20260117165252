import { TokenType } from '../token/type.js';
import { Token } from '../token/token.js';
import { HeadingTokenizer } from './block/heading.js';
import { FenceStartTokenizer } from './block/fence/main.js';
import { HrTokenizer } from './block/hr.js';
import { PagingTokenizer } from './block/paging.js';
import { PartTokenizer } from './block/part.js';

export class Tokenizer {
    constructor(manuscript) {
        this.manuscript = manuscript;
        this.length = manuscript.length;
        this.pos = 0;

        this.blockRules = [
            new FenceStartTokenizer(),
            new HeadingTokenizer(),
            new PagingTokenizer(),
            new HrTokenizer(),
            new PartTokenizer(),
        ];
    }

    *tokenize() {
        while (this.pos < this.length) {
            const lineStart = this.pos;
            let lineEnd = this.manuscript.indexOf('\n', lineStart);
            if (lineEnd === -1) lineEnd = this.length;

            const line = this.manuscript.slice(lineStart, lineEnd);

            let matchedToken = null;
            for (const rule of this.blockRules) {
                matchedToken = rule.match(line, lineStart, lineEnd);
                if (matchedToken) break;
            }

            if (matchedToken) {
                yield matchedToken;
                this.pos = lineEnd + 1;
                continue;
            }

            if (line.trim() === '') {
                yield new Token(TokenType.EMPTY_LINE, [lineStart, lineEnd]);
                this.pos = lineEnd + 1;
                continue;
            }

            yield new Token(TokenType.TEXT, [lineStart, lineEnd]);
            this.pos = lineEnd + 1;
        }

        yield new Token(TokenType.EOF, [this.length, this.length]);
    }
}
