import { JamlError } from '../../../error/src/main.js';
import { Unicode } from '../../../charset/unicode/src/main.js';

export class Text {
    /**
     * @param {string} content - 原稿テキスト
     */
    constructor(content) {
        this._raw = content || '';
        this._text = null; // 正規化済みテキストのキャッシュ
    }

    /**
     * 正規化済みのテキストを取得
     * - Unicode正規化 (Null削除等)
     * - 改行コード統一 (\n)
     */
    get content() {
        if (this._text === null) {
            this._text = this._normalize(this._raw);
        }
        return this._text;
    }

    /**
     * 生の入力テキストを取得
     */
    get raw() {
        return this._raw;
    }

    /**
     * 文字数をカウントする
     * @param {object} options - (将来用) カウント条件
     */
    count(options = {}) {
        // 現状は単純な文字数(UTF-16コードユニット数)を返す
        return this.content.length;
    }

    /**
     * インデックスから行・列を取得 (0-based)
     * @param {number} index 
     * @returns {[number, number]} [row, col]
     */
    getRowCol(index) {
        const text = this.content;
        
        if (index < 0 || index > text.length) {
            throw new JamlError(`範囲外です。index:${index}`);
        }

        let row = 0;
        let col = 0;
        let i = 0;

        while (i < index) {
            if (text[i] === '\n') {
                row++;
                col = 0;
            } else {
                col++;
            }
            i++;
        }
        return [row, col];
    }

    /**
     * 行・列からインデックスを取得 (0-based)
     * @param {number} row 
     * @param {number} col 
     * @returns {number}
     */
    getIndex(row, col) {
        const text = this.content;
        let currentRow = 0;
        let index = 0;
        const length = text.length;

        // 指定された行まで進める
        while (index < length && currentRow < row) {
            if (text[index] === '\n') {
                currentRow++;
            }
            index++;
        }

        // 行が見つかった場合
        if (currentRow === row) {
            const targetIndex = index + col;
            // 行末（次の改行）を超えていないかチェックすべきだが、
            // ここでは簡易的にテキスト全体の範囲チェックのみ行う
            if (targetIndex <= length) {
                return targetIndex;
            }
        }

        throw new JamlError(`範囲外です。row:${row},col:${col}`);
    }

    /**
     * 内部正規化処理
     * @param {string} text 
     * @returns {string}
     */
    _normalize(text) {
        // 1. Unicode正規化 (Charset層に委譲)
        let normalized = Unicode.normalize(text);

        // 2. 改行コード統一 (LF)
        // 既にLFのみなら何もしない (0パス最適化)
        if (!normalized.includes('\r')) {
            return normalized;
        }
        // CRを含む場合のみ置換
        return normalized.replace(/\r\n|\r/g, '\n');
    }
}
