// block-parser.js

export class BlockParser {
    constructor() {
        // 将来的にインラインパーサなどをDIできるようにする
    }

    /**
     * ブロックを解析し、HTML文字列を生成してblock.htmlにセットする
     * @param {Block} block 
     * @param {string} fullText 原稿全文
     */
    parse(block, fullText) {
        if (block.type === 'paging') {
            block.html = ''; // 制御用ブロックなのでHTMLは空
            return;
        }

        const text = fullText.slice(...block.index);

        // TODO: ここでインライン解析 (InlineParser) を呼び出す
        // const inlineHtml = this.inlineParser.parse(text);

        switch (block.type) {
            case 'heading':
                block.html = `<h${block.param.level}>${text}</h${block.param.level}>`;
                break;
            case 'paragraph':
                block.html = `<p>${text}</p>`;
                break;
            case 'hr':
                block.html = `<hr>`;
                break;
            case 'fence':
                // フェンス記号をクラス名に付与
                block.html = `<pre><code class="fence-${block.param.symbol.charCodeAt(0)}">${text}</code></pre>`;
                break;
            case 'part':
                block.html = `<!-- part: ${block.param.path} -->`;
                break;
            default:
                block.html = `<!-- unknown block -->`;
        }
    }
}
