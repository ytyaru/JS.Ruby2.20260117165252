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
            const normalizer = Normalizer.from(this._raw, this._options);
            this._normalized = normalizer.normalize();
        }
        return this._normalized;
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
