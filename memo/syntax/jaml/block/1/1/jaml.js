// jaml.js
import { Blot } from './blot.js';

// ページネーション管理クラス
class Pager {
    constructor(options = {}) {
        this.limit = options.limit || 5; // 仮: 5要素で1ページ
        this.pages = [];
        this.currentBuffer = [];
        this.count = 0;
    }

    /**
     * ブロックをページに追加する
     * @param {Block} block - HTML化済みのプロパティ(.html)を持つブロック
     */
    make(block) {
        // ページ強制分割ブロックの場合
        if (block.type === 'paging') {
            this.flush();
            return;
        }

        // 通常ブロックの追加
        // ここで本来は高さ計算などを行うが、今回は個数カウント
        this.currentBuffer.push(block.html);
        this.count++;

        if (this.count >= this.limit) {
            this.flush();
        }
    }

    // 現在のバッファを1ページとして確定する
    flush() {
        if (this.currentBuffer.length > 0) {
            const pageNum = this.pages.length + 1;
            const pageHtml = `<div data-page="${pageNum}">\n${this.currentBuffer.join('\n')}\n</div>`;
            this.pages.push({ html: pageHtml });
            
            // リセット
            this.currentBuffer = [];
            this.count = 0;
        }
    }

    get items() {
        // 残っているバッファがあれば吐き出す
        if (this.currentBuffer.length > 0) {
            this.flush();
        }
        return this.pages;
    }
}

// Jamlパーサ
export class Jaml {
    // 同期処理
    parse(manuscript) {
        const blot = new Blot(manuscript); // 正規化はBlot内で行われる
        const pager = new Pager();

        for (const block of blot.lex()) {
            this.processBlock(block, blot.manuscript);
            pager.make(block);
        }

        return pager.items.map(p => p.html).join('\n');
    }

    // 非同期処理
    async parseAsync(manuscript) {
        const blot = new Blot(manuscript);
        const pager = new Pager();

        for await (const block of blot.lexAsync()) {
            this.processBlock(block, blot.manuscript);
            pager.make(block);
        }

        return pager.items.map(p => p.html).join('\n');
    }

    /**
     * ブロックをHTML化して block.html に格納する
     * インライン解析などはここで行う想定
     */
    processBlock(block, fullText) {
        // PagingBlockはHTMLを持たない（制御用）
        if (block.type === 'paging') {
            block.html = '';
            return;
        }

        // 原文の取得
        const text = fullText.slice(...block.index);

        // 簡易的なHTML変換（実際はここでインライン解析など詳細な処理が入る）
        switch (block.type) {
            case 'heading':
                block.html = `<h${block.param.level}>${block.param.text}</h${block.param.level}>`;
                break;
            case 'paragraph':
                // 改行を<br>にする等の処理
                block.html = `<p>${text}</p>`;
                break;
            case 'hr':
                block.html = `<hr>`;
                break;
            case 'fence':
                // フェンスの種類に応じた変換
                block.html = `<pre><code class="${block.param.symbol}">${text}</code></pre>`;
                break;
            default:
                block.html = `<!-- unknown block: ${block.type} -->`;
        }
    }
}
