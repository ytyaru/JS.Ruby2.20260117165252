// blot.js
import { Block, HeadingBlock, ParagraphBlock, FenceBlock, HrBlock, PagingBlock, PartBlock, FenceContext } from './block.js';
import { BlockLexer } from './block-lexer.js';

export class Blot {
    constructor(manuscript) {
        // 正規化（改行コードの統一とNULL文字削除のみ最低限行う）
        this._ = {
            manuscript: manuscript.replace(/\r\n|\r/g, '\n').replace(/\0/g, '')
        };
    }

    get manuscript() { return this._.manuscript; }

    /**
     * 同期的に一気に解析する
     */
    lex() {
        const blocks = [];
        for (const block of this.lexGen()) {
            blocks.push(block);
        }
        return blocks;
    }

    /**
     * ジェネレータ（1ブロックずつ返す）
     */
    *lexGen() {
        const scanner = new BlockLexer(this.manuscript);
        let block;
        while ((block = scanner.next())) {
            yield block;
        }
    }

    /**
     * 非同期解析（フリーズ対策）
     * 一定時間処理したら await(0) を挟む
     */
    async *lexAsync() {
        const scanner = new BlockLexer(this.manuscript);
        let block;
        
        // 1フレームの予算時間(ms)。これを超えたら休憩する
        const TIME_BUDGET = 16; 
        let lastYieldTime = performance.now();

        while ((block = scanner.next())) {
            yield block;

            // 時間チェック
            const now = performance.now();
            if (now - lastYieldTime > TIME_BUDGET) {
                await new Promise(resolve => setTimeout(resolve, 0));
                lastYieldTime = performance.now();
            }
        }
    }
}
