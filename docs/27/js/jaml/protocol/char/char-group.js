export class CharGroup {
    #items = []; // 文字の配列 (重複なし)
    #string = ''; // itemsを結合した文字列
    #regexp = null; // キャッシュされた正規表現
    #label = {};   // ラベル

    /**
     * @param {string|Array} source - 文字列、文字配列、またはコードポイントの範囲/単体を含む配列
     * @param {object} [label={}] - グループのラベル { ja: '日本語名', en: 'EnglishName' }
     */
    constructor(source, label = {}) {
        this.#label = label;
        let codePoints = [];

        if (typeof source === 'string') {
            codePoints = [...source].map(c => c.codePointAt(0));
        } else if (Array.isArray(source)) {
            for (const item of source) {
                if (typeof item === 'number') {
                    codePoints.push(item);
                } else if (Array.isArray(item) && item.length === 2) {
                    for (let i = item[0]; i <= item[1]; i++) {
                        codePoints.push(i);
                    }
                } else if (typeof item === 'string') {
                    codePoints.push(...[...item].map(c => c.codePointAt(0)));
                }
            }
        }

        // 重複を除外して items と string を生成
        this.#items = [...new Set(codePoints)].map(cp => String.fromCodePoint(cp));
        this.#string = this.#items.join('');
    }

    get label() { return this.#label; }
    get string() { return this.#string; }
    get items() { return [...this.#items]; } // 不変性を保つためにコピーを返す

    get regexp() {
        if (this.#regexp === null) {
            // 正規表現の特殊文字をエスケープする
            const pattern = this.items.map(char => 
                '\\^$.*+?()[]{}|'.includes(char) ? `\\${char}` : char
            ).join('');
            this.#regexp = new RegExp(`[${pattern}]`, 'gu');
        }
        return this.#regexp;
    }

    is(text) {
        if (typeof text !== 'string' || text.length === 0) return false;
        return [...text].every(char => this.#string.includes(char));
    }

    has(text) {
        if (typeof text !== 'string') return false;
        this.regexp.lastIndex = 0; // グローバル正規表現の状態をリセット
        return this.regexp.test(text);
    }

    remove(text) {
        if (typeof text !== 'string') return '';
        this.regexp.lastIndex = 0;
        return text.replace(this.regexp, '');
    }
}

