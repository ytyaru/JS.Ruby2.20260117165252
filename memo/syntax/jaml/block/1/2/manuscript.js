// manuscript.js

export class Manuscript {
    constructor(text) {
        this._raw = text;
        this._normalized = null;
    }

    get text() {
        if (this._normalized === null) {
            this._normalized = Manuscript.normalize(this._raw);
        }
        return this._normalized;
    }

    /**
     * 原稿テキストの正規化を行う
     * 将来的にはサニタイズ、日本語特有の処理、Unicode正規化の厳密な制御を行う
     */
    static normalize(text) {
        if (!text) return '';

        // 1. 基本的なUnicode正規化 (NFC)
        // 注意: CJK統合漢字の問題など、NFCが不適切な場合はここでカスタム処理を挟む必要がある
        let normalized = text.normalize('NFC');

        // 2. 改行コードの統一 (CRLF, CR -> LF)
        normalized = normalized.replace(/\r\n|\r/g, '\n');

        // 3. セキュリティ対策: Nullバイトの削除
        normalized = normalized.replace(/\0/g, '');

        // 4. 日本語固有の正規化 (将来実装予定)
        // TODO: 濁点(U+309B)・半濁点(U+309C)の結合文字への変換
        // TODO: 結合文字(U+3099, U+309A)と統合文字の揺らぎ統一
        // TODO: 異体字セレクタの扱い決定
        // normalized = this.normalizeJapanese(normalized);

        // 5. 制御文字のサニタイズ (Jamlで禁止する文字の除外)
        // normalized = this.sanitizeControlChars(normalized);

        return normalized;
    }

    // 将来の実装用スタブ
    static normalizeJapanese(text) {
        // 濁点・半濁点の正規化ロジックをここに実装
        return text;
    }

    static sanitizeControlChars(text) {
        // 許可されていない制御コードを削除するロジック
        return text;
    }
}
