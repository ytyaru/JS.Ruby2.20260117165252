// lexers/fence-lexer.js
import { FenceBlock, FenceContext } from '../block.js';

export class FenceBlockLexer {
    // フェンス開始判定
    process(lexer, line, lineStart, lineEnd) {
        const fenceCheck = FenceContext.parse(line);
        
        if (fenceCheck.valid) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;

            // 状態更新（ブロックは返さない）
            lexer.fenceState.inFence = true;
            lexer.fenceState.symbol = fenceCheck.symbol;
            lexer.fenceState.length = fenceCheck.fenceLength;
            lexer.fenceState.startIndex = lineStart;
            lexer.fenceState.headerStart = lineStart;
            lexer.fenceState.headerEnd = lineEnd;
            
            return null; // BlockLexer側でinFenceフラグを見てcontinueする
        }
        return null;
    }

    // フェンス内部処理
    processInFence(lexer, line, lineStart, lineEnd) {
        const state = lexer.fenceState;
        const trimmed = line.trim();
        
        // 終了判定
        const isClose = trimmed.startsWith(state.symbol) && 
                        trimmed.length >= state.length &&
                        trimmed.split('').every(c => c === state.symbol);

        if (isClose) {
            const blockStart = state.startIndex;
            const blockEnd = lineEnd;
            
            const headerText = lexer.text.slice(state.headerStart, state.headerEnd);
            const fenceInfo = FenceContext.parse(headerText);
            
            const block = new FenceBlock(fenceInfo, [blockStart, blockEnd]);
            
            state.inFence = false;
            return block;
        }
        return null;
    }
}
