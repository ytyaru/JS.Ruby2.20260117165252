export class TextCounter {
    /**
     * テキストの文字数をカウントする
     * @param {string} text 
     * @param {object} options 
     * @returns {number}
     */
    static count(text, options = {}) {
        if (!text) return 0;
        
        // TODO: 将来的な実装要件
        // optionsに応じて以下の処理を行う想定
        // 1. Jamlメタ文字（フェンス記号、見出しマーカー等）を除外した純粋なテキストのカウント
        // 2. 空白文字（スペース、タブ、改行）を除外したカウント
        // 3. ルビ文字（《...》の中身や親文字）の扱い（親文字のみカウントするなど）
        // 4. サロゲートペアを1文字としてカウント
        
        return text.length;
    }
}
