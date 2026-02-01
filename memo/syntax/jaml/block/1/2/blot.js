// blot.js
import { Manuscript } from './manuscript.js';
import { BlockLexer } from './block-lexer.js';

export class Blot {
    constructor(text) {
        // Manuscriptクラスに正規化の責務を委譲
        this._manuscript = new Manuscript(text);
    }

    get manuscript() { return this._manuscript.text; }

    lex() {
        const blocks = [];
        for (const block of this.lexGen()) blocks.push(block);
        return blocks;
    }

    *lexGen() {
        const lexer = new BlockLexer(this.manuscript);
        let block;
        while ((block = lexer.next())) yield block;
    }

    async *lexAsync() {
        const lexer = new BlockLexer(this.manuscript);
        let block;
        const TIME_BUDGET = 16; 
        let lastYieldTime = performance.now();

        while ((block = lexer.next())) {
            yield block;

            const now = performance.now();
            if (now - lastYieldTime > TIME_BUDGET) {
                await new Promise(resolve => setTimeout(resolve, 0));
                lastYieldTime = performance.now();
            }
        }
    }
}
