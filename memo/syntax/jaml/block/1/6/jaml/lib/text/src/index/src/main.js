import { JamlError } from '../../../../error/src/main.js';

export class TextIndex {
    /**
     * 行・列からインデックスを取得
     * @param {string} text 
     * @param {number} row (0-based)
     * @param {number} col (0-based)
     * @returns {number}
     */
    static getIndex(text, row, col) {
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

        // 行が見つかり、かつ計算したインデックスが範囲内であれば返す
        if (currentRow === row) {
            const targetIndex = index + col;
            // 次の改行までの距離（行の長さ）チェックは厳密には必要かもしれませんが、
            // ここでは単純にテキスト全体の範囲内かどうかをチェックします
            if (targetIndex <= length) {
                return targetIndex;
            }
        }

        throw new JamlError(`範囲外です。row:${row},col:${col}`);
    }

    /**
     * インデックスから行・列を取得
     * @param {string} text 
     * @param {number} index 
     * @returns {[number, number]} [row, col] (0-based)
     */
    static getRowCol(text, index) {
        // 範囲チェック
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
}

