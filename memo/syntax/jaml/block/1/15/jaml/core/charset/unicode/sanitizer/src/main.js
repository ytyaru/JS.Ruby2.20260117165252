export class Sanitizer {
    /**
     * Unicode文字列から危険な文字やシーケンスを除去する
     * @param {string} text
     * @returns {string}
     */
    static sanitize(text) {
        if (!text) return '';

        // 1. ヌルバイトの削除 (セキュリティ対策: ヌルバイト攻撃防止)
        let sanitized = text.replace(/\0/g, '');

        // TODO: 将来的な拡張
        // - 不正なバイトシーケンスの除去
        // - 特定の制御文字（例: 垂直タブなど）の除去

        return sanitized;
    }
}

