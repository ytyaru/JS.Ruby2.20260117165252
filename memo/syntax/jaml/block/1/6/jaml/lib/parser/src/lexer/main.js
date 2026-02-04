import { TokenType } from '../token/type.js';
import { HeadingBlock } from '../ast-node/block/heading.js';
import { ParagraphBlock } from '../ast-node/block/paragraph.js';
import { HrBlock } from '../ast-node/block/hr.js';
import { PagingBlock } from '../ast-node/block/paging.js';
import { PartBlock } from '../ast-node/block/part.js';
import { FenceBlock } from '../ast-node/block/fence.js';
import { FenceContext } from '../ast-node/block/fence/context.js';

// 依存ライブラリ
import { JamlError } from '../../../error/src/main.js';
import { TextIndex } from '../../../text/src/index/src/main.js';

export class Lexer {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
        this.buffer = [];
        this.bufferStartIndex = -1;
        this.bufferEndIndex = -1;

        this.fenceState = {
            inFence: false,
            symbol: null,
            length: 0,
            startToken: null,
            content: []
        };
    }

    *lex() {
        for (const token of this.tokenizer.tokenize()) {
            if (this.fenceState.inFence) {
                const closedBlock = this._handleInFence(token);
                if (closedBlock) {
                    yield closedBlock;
                }
                continue;
            }

            if (token.type === TokenType.FENCE_START) {
                const pending = this._flushBuffer();
                if (pending) yield pending;
                this._enterFence(token);
                continue;
            }

            // ... (Heading, Hr, Paging, Part, EmptyLine の処理は以前と同じ) ...
            if (token.type === TokenType.BLOCK_HEADING) {
                const pending = this._flushBuffer();
                if (pending) yield pending;
                yield new HeadingBlock(token.params.level, token.params.content, token.index);
                continue;
            }
            if (token.type === TokenType.TEXT) {
                this._addToBuffer(token);
                continue;
            }
            if (token.type === TokenType.EOF) {
                break;
            }
        }

        const pending = this._flushBuffer();
        if (pending) yield pending;

        // フェンスが閉じられていない場合のエラー処理
        if (this.fenceState.inFence) {
            const startToken = this.fenceState.startToken;
            const manuscript = this.tokenizer.manuscript;
            
            // TextIndexを使って行・列を取得 (0-based -> 1-based)
            const [row, col] = TextIndex.getRowCol(manuscript, startToken.index[0]);
            
            throw new JamlError(
                `フェンスブロックが閉じられていません。開始位置: 行${row + 1}, 列${col + 1}`
            );
        }
    }

    _addToBuffer(token) {
        if (this.buffer.length === 0) this.bufferStartIndex = token.index[0];
        this.bufferEndIndex = token.index[1];
        this.buffer.push(token);
    }

    _flushBuffer() {
        if (this.buffer.length === 0) return null;
        const block = new ParagraphBlock([this.bufferStartIndex, this.bufferEndIndex]);
        this.buffer = [];
        this.bufferStartIndex = -1;
        this.bufferEndIndex = -1;
        return block;
    }

    _enterFence(token) {
        this.fenceState.inFence = true;
        this.fenceState.symbol = token.params.symbol;
        this.fenceState.length = token.params.length;
        this.fenceState.startToken = token;
        this.fenceState.content = [];
    }

    _handleInFence(token) {
        // EOFが来たらここでは処理せず、メインループの最後でエラーにする
        if (token.type === TokenType.EOF) return null;

        if (token.type === TokenType.TEXT || token.type === TokenType.FENCE_START) {
            const text = this.tokenizer.manuscript.slice(token.index[0], token.index[1]).trim();
            const isClose = text.startsWith(this.fenceState.symbol) &&
                            text.length >= this.fenceState.length &&
                            text.split('').every(c => c === this.fenceState.symbol);

            if (isClose) {
                const block = this._createFenceBlock(token.index[1]);
                this.fenceState.inFence = false;
                return block;
            }
        }
        this.fenceState.content.push(token);
        return null;
    }

    _createFenceBlock(endIndex) {
        const startToken = this.fenceState.startToken;
        const fenceInfo = new FenceContext(startToken.params.symbol, startToken.params.args);
        return new FenceBlock(fenceInfo, [startToken.index[0], endIndex]);
    }
}
