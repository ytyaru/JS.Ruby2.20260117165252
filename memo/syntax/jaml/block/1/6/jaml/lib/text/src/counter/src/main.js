export class TextCounter {
    /**
     * テキストの文字数をカウントする
     * @param {string} text 
     * @param {object} options 
     * @returns {number}
     */
    static count(text, options = {}) {
        if (!text) return 0;
        
        // TODO: 将来的な実装要件 (optionsによる条件分岐)
        // 1. Jamlメタ文字の除外
        //    - フェンス記号 (```, !!!, etc)
        //    - 見出しマーカー (# )
        //    - インライン記法 (《...》, |...《...》)
        // 2. 空白文字の除外
        //    - スペース、タブ、改行コードをカウントしないオプション
        // 3. ルビの扱い
        //    - 親文字のみカウントする
        //    - ルビ文字のみカウントする
        //    - 両方カウントする
        // 4. Unicodeの扱い
        //    - サロゲートペアを1文字としてカウントする (現状のlengthはUTF-16コードユニット数)
        //    - 結合文字 (例: か + ゛) を1文字としてカウントする
        
        return text.length;
    }
}

