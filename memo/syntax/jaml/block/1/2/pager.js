// pager.js

export class Pager {
    constructor(options = {}) {
        this.limit = options.limit || 5; // 仮: 5要素で1ページ
        this.pages = [];
        this.currentBuffer = [];
        this.count = 0;
    }

    /**
     * ブロックを受け取り、ページ分割判定を行う
     * @param {Block} block 
     */
    add(block) {
        // 強制改ページ
        if (block.type === 'paging') {
            this.flush();
            return;
        }

        // HTMLがないブロック（制御用など）はスキップ
        if (block.html === null) return;

        this.currentBuffer.push(block.html);
        this.count++;

        // TODO: ここで将来、文字数や高さによる厳密な計算を行う
        if (this.count >= this.limit) {
            this.flush();
        }
    }

    flush() {
        if (this.currentBuffer.length > 0) {
            const pageNum = this.pages.length + 1;
            const pageHtml = `<div data-page="${pageNum}">\n${this.currentBuffer.join('\n')}\n</div>`;
            this.pages.push({ html: pageHtml });
            
            this.currentBuffer = [];
            this.count = 0;
        }
    }

    get items() {
        if (this.currentBuffer.length > 0) {
            this.flush();
        }
        return this.pages;
    }
}
