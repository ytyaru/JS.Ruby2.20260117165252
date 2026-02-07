export class Normalizer {
    /**
     * Unicode文字列の正規化を行う
     * @param {string} text - 対象テキスト
     * @param {string} form - 正規化形式 ('NFC', 'NFD', 'NFKC', 'NFKD')
     * @returns {string}
     */
    static normalize(text, form = 'NFC') {
        if (!text) return '';

        // 【重要】CJK統合漢字の問題により、一律の正規化は現在無効化しています。
        // String.prototype.normalize(form) を実行すると、
        // 異体字（例: 神 -> 神）が意図せず統合文字に変換され、
        // 原稿の意図した字形が失われる可能性があるためです。
        //
        // 将来的に、CJK統合漢字の範囲を除外して正規化を行う、
        // あるいはユーザーがオプションで挙動を選択できるような拡張を検討します。
        
        // return text.normalize(form);

        // 現状は入力をそのまま返す
        return text;
    }
}

