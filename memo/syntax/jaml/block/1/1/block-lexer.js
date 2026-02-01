// block-lexer.js
import { ParagraphBlock } from './block.js';
import { FenceBlockLexer } from './lexers/fence-lexer.js';
import { HeadingBlockLexer } from './lexers/heading-lexer.js';
import { PagingBlockLexer } from './lexers/paging-lexer.js';
import { HrBlockLexer } from './lexers/hr-lexer.js';
import { PartBlockLexer } from './lexers/part-lexer.js';

export class BlockLexer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.length = text.length;
        
        // パラグラフ生成用のバッファ
        this.bufferStart = null;
        this.bufferEnd = null;

        // フェンスブロックの状態管理
        this.fenceState = {
            inFence: false,
            symbol: null,
            length: 0,
            startIndex: 0,
            headerStart: 0,
            headerEnd: 0
        };

        // 解析器の登録（順序が重要）
        // FenceBlockLexerは「フェンス内部」と「フェンス開始」の両方を扱うため特殊
        this.fenceLexer = new FenceBlockLexer();
        
        this.lexers = [
            new HeadingBlockLexer(), // 見出し（スペース必須）を最優先
            new PagingBlockLexer(),  // ページ分割（10文字以上）
            new HrBlockLexer(),      // 水平線（5文字以上）
            this.fenceLexer,         // フェンス開始
            new PartBlockLexer()     // 外部参照
        ];
    }

    next() {
        if (this.pos >= this.length) return this.flushBuffer();

        while (this.pos < this.length) {
            const lineStart = this.pos;
            let lineEnd = this.text.indexOf('\n', lineStart);
            if (lineEnd === -1) lineEnd = this.length;

            const line = this.text.slice(lineStart, lineEnd);

            // 1. フェンス内部の処理（最優先）
            if (this.fenceState.inFence) {
                const block = this.fenceLexer.processInFence(this, line, lineStart, lineEnd);
                if (block) {
                    this.pos = lineEnd + 1;
                    return block;
                }
                // フェンス継続中
                this.pos = lineEnd + 1;
                continue;
            }

            // 2. 各種ブロックの判定
            let matchedBlock = null;
            for (const lexer of this.lexers) {
                matchedBlock = lexer.process(this, line, lineStart, lineEnd);
                // フェンス開始処理が行われた場合（ブロックはnullだがinFenceがtrueになった）
                if (this.fenceState.inFence) {
                    break; // ループを抜けて、次の行からフェンス内部処理へ
                }
                if (matchedBlock) break;
            }

            if (this.fenceState.inFence) {
                this.pos = lineEnd + 1;
                continue;
            }

            if (matchedBlock) {
                // ブロックが見つかった場合、posを進めて返す
                // (Lexer内で flushBuffer が呼ばれている前提)
                this.pos = lineEnd + 1;
                return matchedBlock;
            }

            // 3. 空行の処理
            if (line.trim() === '') {
                const pending = this.flushBuffer();
                this.pos = lineEnd + 1;
                if (pending) return pending;
                continue;
            }

            // 4. パラグラフバッファリング
            if (this.bufferStart === null) this.bufferStart = lineStart;
            this.bufferEnd = lineEnd;
            this.pos = lineEnd + 1;
        }

        return this.flushBuffer();
    }

    flushBuffer() {
        if (this.bufferStart !== null) {
            const block = new ParagraphBlock([this.bufferStart, this.bufferEnd]);
            this.bufferStart = null;
            this.bufferEnd = null;
            return block;
        }
        return null;
    }
}
