export class GrammarRule {
    /**
     * @param {string} name - ルール名
     * @param {RegExp} pattern - マッチ用正規表現
     */
    constructor(name, pattern) {
        this.name = name;
        this.pattern = pattern;
    }

    /**
     * テキストに対するマッチングを行う
     * @param {string} text 
     * @returns {object|null}
     */
    match(text) {
        return text.match(this.pattern);
    }
}

