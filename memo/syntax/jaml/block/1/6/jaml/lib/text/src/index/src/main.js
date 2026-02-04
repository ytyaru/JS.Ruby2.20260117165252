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

        while (index < length && currentRow < row) {
            const char = text[index];
            if (char === '\n') {
                currentRow++;
            }
            index++;
        }

        if (currentRow === row) {
            return Math.min(index + col, length);
        }
        return -1; // 範囲外
    }

    /**
     * インデックスから行・列を取得
     * @param {string} text 
     * @param {number} index 
     * @returns {[number, number]} [row, col]
     */
    static getRowCol(text, index) {
        let row = 0;
        let col = 0;
        let i = 0;

        while (i < index && i < text.length) {
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
