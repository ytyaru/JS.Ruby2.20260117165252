import { Normalizer } from './normalizer/src/main.js';
import { TextCounter } from './counter/src/main.js';
import { TextIndex } from './index/src/main.js';

export class Manuscript {
    constructor(text, options = {}) {
        this._raw = text;
        this._options = options;
        this._normalized = null;
    }

    get text() {
        if (this._normalized === null) {
            // 【重要】内部処理用には強制的に '\n' を使用する
            // ユーザーが options.newline に何をセットしていても、
            // 解析エンジン(Parser)は '\n' 前提で動くため。
            const internalOptions = { 
                ...this._options, 
                newline: '\n' 
            };
            const normalizer = Normalizer.from(this._raw, internalOptions);
            this._normalized = normalizer.normalize();
        }
        return this._normalized;
    }

    // 内部は常にLFなので、これを参照するクラスは固定値で動ける
    get newline() {
        return '\n';
    }

    count(options = {}) {
        return TextCounter.count(this.text, options);
    }

    getRowCol(index) {
        return TextIndex.getRowCol(this.text, index);
    }

    getIndex(row, col) {
        return TextIndex.getIndex(this.text, row, col);
    }
}

