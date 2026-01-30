//サロゲートペア用コードがsourceに含まれている場合や、sourceが大量にある場合はCharGroupでなくこちらを使う。
export class CharGroupLarge {
    #ranges = []; // [[start, end], ...] の形式でソート済みの数値配列
    #label = {};
    #regexp = null;

    constructor(source, label = {}) {
        this.#label = label;
        let codePoints = new Set();
        let rawRanges = [];

        // 1. 入力ソースを数値範囲に正規化
        const items = Array.isArray(source) ? source : [...source];
        for (const item of items) {
            if (typeof item === 'number') {
                rawRanges.push([item, item]);
            } else if (Array.isArray(item) && item.length === 2) {
                rawRanges.push([item[0], item[1]]);
            } else if (typeof item === 'string') {
                for (const char of item) {
                    const cp = char.codePointAt(0);
                    rawRanges.push([cp, cp]);
                }
            }
        }

        // 2. 範囲をソートして結合（最適化）
        if (rawRanges.length > 0) {
            rawRanges.sort((a, b) => a[0] - b[0]);
            let current = rawRanges[0];
            for (let i = 1; i < rawRanges.length; i++) {
                let next = rawRanges[i];
                if (next[0] <= current[1] + 1) {
                    current[1] = Math.max(current[1], next[1]);
                } else {
                    this.#ranges.push(current);
                    current = next;
                }
            }
            this.#ranges.push(current);
        }
    }

    /**
     * 指定されたコードポイントが範囲内に含まれるか二分探索で判定
     */
    #includes(cp) {
        let low = 0;
        let high = this.#ranges.length - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const [start, end] = this.#ranges[mid];
            if (cp >= start && cp <= end) return true;
            if (cp < start) high = mid - 1;
            else low = mid + 1;
        }
        return false;
    }

    get label() { return this.#label; }

    get items() {
        const res = [];
        for (const [start, end] of this.#ranges) {
            for (let i = start; i <= end; i++) {
                res.push(String.fromCodePoint(i));
            }
        }
        return res;
    }

    get regexp() {
        if (this.#regexp === null) {
            // 文字クラス [] の中で安全に範囲表記 (u{H}-u{H}) を生成
            // u フラグが必須
            const pattern = this.#ranges.map(([start, end]) => {
                const s = `\\u{${start.toString(16)}}`;
                if (start === end) return s;
                return `${s}-\\u{${end.toString(16)}}`;
            }).join('');
            this.#regexp = new RegExp(`[${pattern}]`, 'gu');
        }
        return this.#regexp;
    }

    is(text) {
        if (typeof text !== 'string' || text.length === 0) return false;
        // イテレータを使ってサロゲートペアを正しく扱う
        for (const char of text) {
            if (!this.#includes(char.codePointAt(0))) return false;
        }
        return true;
    }

    has(text) {
        if (typeof text !== 'string') return false;
        this.regexp.lastIndex = 0;
        return this.regexp.test(text);
    }

    remove(text) {
        if (typeof text !== 'string') return '';
        this.regexp.lastIndex = 0;
        return text.replace(this.regexp, '');
    }
}

