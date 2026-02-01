// blot.js
import { Block, HeadingBlock, ParagraphBlock, FenceBlock, HrBlock, PagingBlock, PartBlock, FenceContext } from './block.js';

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
        const scanner = new Scanner(this.manuscript);
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
        const scanner = new Scanner(this.manuscript);
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

class Scanner {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.length = text.length;
        this.bufferStart = null;
        
        this.inFence = false;
        this.fenceSymbol = null;
        this.fenceLength = 0;
        this.fenceStartIndex = 0;
        this.fenceHeaderStart = 0;
        this.fenceHeaderEnd = 0;
    }
    next() {
        if (this.pos >= this.length) return this.flushBuffer();

        while (this.pos < this.length) {
            const lineStart = this.pos;
            let lineEnd = this.text.indexOf('\n', lineStart);
            if (lineEnd === -1) lineEnd = this.length;

            const line = this.text.slice(lineStart, lineEnd);

            // --- フェンスブロック内部の処理 ---
            if (this.inFence) {
                const trimmed = line.trim();
                // 終了判定: 開始と同じ記号、同じ長さ以上、引数なし(記号のみ)
                const isClose = trimmed.startsWith(this.fenceSymbol) && 
                                trimmed.length >= this.fenceLength &&
                                trimmed.split('').every(c => c === this.fenceSymbol);

                if (isClose) {
                    const blockStart = this.fenceStartIndex;
                    const blockEnd = lineEnd;
                    
                    const headerText = this.text.slice(this.fenceHeaderStart, this.fenceHeaderEnd);
                    const fenceInfo = FenceContext.parse(headerText);
                    
                    const block = new FenceBlock(fenceInfo, [blockStart, blockEnd]);
                    
                    this.inFence = false;
                    this.pos = lineEnd + 1;
                    return block;
                }
                
                this.pos = lineEnd + 1;
                continue;
            } else {
                // --- 通常モード ---
            // 1. 水平線 / ページ分割 (=====) の判定
            // 条件: 行頭から = が5つ以上続き、それ以外の文字がない
            // = はフェンス文字リストから外れたため、ここで個別に処理する
            const hrMatch = line.match(/^={5,}$/);
            if (hrMatch) {
                const pending = this.flushBuffer();
                if (pending) return pending;

                const len = line.length; // trim済み前提ならlength
                const block = (len >= 10) 
                    ? new PagingBlock([lineStart, lineEnd])
                    : new HrBlock([lineStart, lineEnd]);
                
                this.pos = lineEnd + 1;
                return block;
            }

            // 2. フェンス開始判定
            // ここで ### もフェンスとして判定される
            const fenceCheck = FenceContext.parse(line);
            if (fenceCheck.valid) {
                const pending = this.flushBuffer();
                if (pending) return pending;

                this.inFence = true;
                this.fenceSymbol = fenceCheck.symbol;
                this.fenceLength = fenceCheck.fenceLength;
                this.fenceStartIndex = lineStart;
                this.fenceHeaderStart = lineStart;
                this.fenceHeaderEnd = lineEnd;
                
                this.pos = lineEnd + 1;
                continue;
            }

            // 3. 見出し (# )
            // 注意: ### は上記フェンス判定で吸われるため、ここは # か ## のみ到達する
            // もし ### を見出しにしたい場合は仕様変更が必要
            const headingMatch = line.match(/^(#{1,6})(.*)$/);
            if (headingMatch) {
                const pending = this.flushBuffer();
                if (pending) return pending;

                const level = headingMatch[1].length;
                const content = headingMatch[2].trim();
                const block = new HeadingBlock(level, content, [lineStart, lineEnd]);
                this.pos = lineEnd + 1;
                return block;
            }

            // 4. 外部ファイル参照 (part:)
            if (line.startsWith('part:')) {
                const pending = this.flushBuffer();
                if (pending) return pending;

                const path = line.substring(5).trim();
                const block = new PartBlock(path, [lineStart, lineEnd]);
                this.pos = lineEnd + 1;
                return block;
            }

            // 5. 空行
            if (line.trim() === '') {
                const pending = this.flushBuffer();
                this.pos = lineEnd + 1;
                if (pending) return pending;
                continue;
            }

            // 6. パラグラフバッファリング
            if (this.bufferStart === null) this.bufferStart = lineStart;
            this.bufferEnd = lineEnd;
            this.pos = lineEnd + 1;
        }

        return this.flushBuffer();
    }

/**
 * 内部クラス: 状態を持ち、次々とブロックを切り出すスキャナ
 */
class Scanner {
    constructor(text) {
        this.text = text;
        this.pos = 0; // 現在の解析位置
        this.length = text.length;
        this.bufferStart = null; // パラグラフ用バッファの開始位置
    }

                // 1. フェンス開始チェック
                const fenceMatch = line.match(/^(`{3,})(.*)$/);
                if (fenceMatch) {
                    const pending = this.flushBuffer();
                    if (pending) {
                        // パラグラフがあったので、フェンス処理前にそれを返す
                        // posは進めない（次回この行からフェンスとして処理するため）
                        return pending;
                    }

                    // フェンスモード開始
                    this.inFence = true;
                    this.fenceCloseStr = fenceMatch[1]; // 終了条件: 同じ数のバッククォート
                    this.fenceStartIndex = lineStart;
                    this.fenceHeaderStart = lineStart;
                    this.fenceHeaderEnd = lineEnd;
                    
                    this.pos = lineEnd + 1;
                    continue; // 次の行へ
                }

                // 2. 見出しチェック (# )
                const headingMatch = line.match(/^(#{1,6})(.*)$/);
                if (headingMatch) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    // 見出しブロック生成
                    const level = headingMatch[1].length;
                    const content = headingMatch[2].trim();
                    // ID解析 {#slug} などはここで content をさらにパースしてもよい
                    
                    const block = new HeadingBlock(level, content, null, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 3. 水平線 / ページ分割 (=====)
                const hrMatch = line.match(/^={5,}(.*)$/);
                if (hrMatch) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    const len = line.match(/^=+/)[0].length;
                    const param = hrMatch[1];
                    
                    // 10個以上ならページ分割、それ以外ならHRといった判定
                    const type = len >= 10 ? 'paging' : 'hr';
                    // ここでは簡易的にHrBlockとして返す（必要に応じてクラスを分ける）
                    const block = new HrBlock({ type, raw: param }, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 4. 外部ファイル参照 (part:)
                if (line.startsWith('part:')) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    const path = line.substring(5).trim();
                    const block = new PartBlock(path, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 5. 空行（パラグラフの区切り）
                if (line.trim() === '') {
                    const pending = this.flushBuffer();
                    this.pos = lineEnd + 1;
                    if (pending) return pending;
                    // 連続する空行は無視（あるいは空行ブロックを作るならここで処理）
                    continue;
                }

                // 6. 通常テキスト（パラグラフの一部）
                if (this.bufferStart === null) {
                    this.bufferStart = lineStart;
                }
                // バッファ終了位置を更新（現在の行末まで）
                this.bufferEnd = lineEnd;
            }

            // 次の行へ
            this.pos = lineEnd + 1;
        }
        
        return this.flushBuffer();
    }

    /**
     * 溜まっているテキストがあればParagraphBlockとして吐き出す
     */
    flushBuffer() {
        if (this.bufferStart !== null) {
            const block = new ParagraphBlock([this.bufferStart, this.bufferEnd]);
            this.bufferStart = null;
            this.bufferEnd = null;
            return block;
        }
        return null;
    }

    /**
     * 次のブロックを返す。終了ならnull。
     */
    next() {
        if (this.pos >= this.length) {
            return this.flushBuffer(); // 末尾に残ったパラグラフがあれば返す
        }

        // 行単位でループし、ブロックの区切りを探す
        while (this.pos < this.length) {
            const lineStart = this.pos;
            let lineEnd = this.text.indexOf('\n', lineStart);
            if (lineEnd === -1) lineEnd = this.length;

            const line = this.text.slice(lineStart, lineEnd);
            
            // --- フェンスブロックの処理 ---
            // フェンス開始判定: 行頭から ` が3つ以上
            if (this.inFence) {
                // フェンス終了判定: 開始時と同じ長さのバッククォートのみの行
                if (line.trim() === this.fenceCloseStr) {
                    const blockStart = this.fenceStartIndex;
                    const blockEnd = lineEnd; // 改行を含まない位置までとするか、含むかは仕様次第（ここでは行末まで）
                    
                    // フェンスブロック生成
                    const fenceParamText = this.text.slice(this.fenceHeaderStart, this.fenceHeaderEnd);
                    const fenceInfo = FenceContext.parse(fenceParamText);
                    
                    const block = new FenceBlock(fenceInfo, [blockStart, blockEnd]);
                    
                    // 状態リセット
                    this.inFence = false;
                    this.pos = lineEnd + 1;
                    return block;
                }
            } else {
                // --- 通常モード ---
                
                // 1. フェンス開始チェック
                const fenceMatch = line.match(/^(`{3,})(.*)$/);
                if (fenceMatch) {
                    const pending = this.flushBuffer();
                    if (pending) {
                        // パラグラフがあったので、フェンス処理前にそれを返す
                        // posは進めない（次回この行からフェンスとして処理するため）
                        return pending;
                    }

                    // フェンスモード開始
                    this.inFence = true;
                    this.fenceCloseStr = fenceMatch[1]; // 終了条件: 同じ数のバッククォート
                    this.fenceStartIndex = lineStart;
                    this.fenceHeaderStart = lineStart;
                    this.fenceHeaderEnd = lineEnd;
                    
                    this.pos = lineEnd + 1;
                    continue; // 次の行へ
                }

                // 2. 見出しチェック (# )
                const headingMatch = line.match(/^(#{1,6})(.*)$/);
                if (headingMatch) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    // 見出しブロック生成
                    const level = headingMatch[1].length;
                    const content = headingMatch[2].trim();
                    // ID解析 {#slug} などはここで content をさらにパースしてもよい
                    
                    const block = new HeadingBlock(level, content, null, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 3. 水平線 / ページ分割 (=====)
                const hrMatch = line.match(/^={5,}(.*)$/);
                if (hrMatch) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    const len = line.match(/^=+/)[0].length;
                    const param = hrMatch[1];
                    
                    // 10個以上ならページ分割、それ以外ならHRといった判定
                    const type = len >= 10 ? 'paging' : 'hr';
                    // ここでは簡易的にHrBlockとして返す（必要に応じてクラスを分ける）
                    const block = new HrBlock({ type, raw: param }, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 4. 外部ファイル参照 (part:)
                if (line.startsWith('part:')) {
                    const pending = this.flushBuffer();
                    if (pending) return pending;

                    const path = line.substring(5).trim();
                    const block = new PartBlock(path, [lineStart, lineEnd]);
                    this.pos = lineEnd + 1;
                    return block;
                }

                // 5. 空行（パラグラフの区切り）
                if (line.trim() === '') {
                    const pending = this.flushBuffer();
                    this.pos = lineEnd + 1;
                    if (pending) return pending;
                    // 連続する空行は無視（あるいは空行ブロックを作るならここで処理）
                    continue;
                }

                // 6. 通常テキスト（パラグラフの一部）
                if (this.bufferStart === null) {
                    this.bufferStart = lineStart;
                }
                // バッファ終了位置を更新（現在の行末まで）
                this.bufferEnd = lineEnd;
            }

            // 次の行へ
            this.pos = lineEnd + 1;
        }
        
        return this.flushBuffer();
    }

    /**
     * 溜まっているテキストがあればParagraphBlockとして吐き出す
     */
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
