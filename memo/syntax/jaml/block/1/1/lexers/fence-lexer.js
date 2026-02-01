// lexers/fence-lexer.js
import { FenceBlock, FenceContext } from '../block.js';

export class FenceBlockLexer {
    // フェンス開始の判定
    process(lexer, line, lineStart, lineEnd) {
        const fenceCheck = FenceContext.parse(line);
        
        if (fenceCheck.valid) {
            const pending = lexer.flushBuffer();
            if (pending) return pending;

            // 状態を更新してフェンスモードへ移行
            lexer.fenceState.inFence = true;
            lexer.fenceState.symbol = fenceCheck.symbol;
            lexer.fenceState.length = fenceCheck.fenceLength;
            lexer.fenceState.startIndex = lineStart;
            lexer.fenceState.headerStart = lineStart;
            lexer.fenceState.headerEnd = lineEnd;
            
            // ここではブロックを返さず、nullを返してループを継続させる（内部処理へ移行）
            // ただし、BlockLexerの構造上、ここでnullを返すと「行が進んでしまう」ため、
            // 設計上「開始行を消費した」ことを伝える必要がある。
            // 今回のBlockLexerの実装では、Lexerがブロックを返さないとパラグラフバッファに入る。
            // そのため、フェンス開始時は「nullを返すが、バッファには入れない」制御が必要だが、
            // 簡略化のため「開始行は処理済み」として扱い、次の行から inFence ループに入るようにする。
            
            // 修正: BlockLexer側で「inFenceになったらループcontinue」するロジックにするため、
            // ここでは「マッチした」ことだけを伝えたいが、戻り値はBlock型である必要がある。
            // 特例として、フェンス開始時は「まだブロックは完成していない」が「処理はした」状態。
            // BlockLexerのループ構造を少し変えるか、ここでダミーを返すかだが、
            // 最も綺麗なのは「BlockLexerが inFence フラグを見て制御する」こと。
            // よって、このメソッドは「開始行の検出と状態更新」のみを行い、
            // BlockLexerには「処理完了シグナル」として特殊な値を返すか、
            // あるいはBlockLexerのループ内で `lexer.fenceState.inFence` をチェックしてもらう。
            
            // 今回は BlockLexer.next() 内で `if (matchedBlock)` で判定しているので、
            // ここで null を返すとパラグラフ扱いになってしまう。
            // したがって、BlockLexerのロジックに合わせて「nullを返すが、inFenceがtrueならcontinue」
            // という処理をBlockLexer側に追加するのが適切（実装済み）。
            
            return null; 
        }
        return null;
    }

    // フェンス内部の終了判定
    processInFence(lexer, line, lineStart, lineEnd) {
        const state = lexer.fenceState;
        const trimmed = line.trim();
        
        // 終了判定: 開始と同じ記号、同じ長さ以上、引数なし(記号のみ)
        const isClose = trimmed.startsWith(state.symbol) && 
                        trimmed.length >= state.length &&
                        trimmed.split('').every(c => c === state.symbol);

        if (isClose) {
            const blockStart = state.startIndex;
            const blockEnd = lineEnd;
            
            const headerText = lexer.text.slice(state.headerStart, state.headerEnd);
            const fenceInfo = FenceContext.parse(headerText);
            
            const block = new FenceBlock(fenceInfo, [blockStart, blockEnd]);
            
            // 状態リセット
            state.inFence = false;
            return block;
        }
        return null;
    }
}
