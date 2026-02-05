export class BlockRule {
    /**
     * @param {string} name - ルール名 (例: 'heading')
     * @param {RegExp} pattern - 判定用正規表現
     */
    constructor(name, pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    /**
     * 行がこのルールにマッチするか判定する
     * @param {string} line 
     * @returns {object|null} マッチ結果
     */
    match(line) {
        return line.match(this.pattern);
    }
}

