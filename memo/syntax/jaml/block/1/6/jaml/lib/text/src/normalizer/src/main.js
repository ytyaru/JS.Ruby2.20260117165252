import { UnicodeContext } from './context/unicode.js';
import { OsContext } from './context/os.js';
import { JapaneseContext } from './context/japanese.js';
import { JamlFormat } from './format/jaml.js';
import { HtmlFormat } from './format/html.js';

export class Normalizer {
    static from(data, options = {}) {
        const opts = {
            type: 'jaml',
            newline: '\n',
            ja: false,
            ...options
        };
        return new Normalizer(data, opts);
    }

    constructor(data, options) {
        this._ = { data, options };
        this._normalized = null;
    }

    normalize() {
        if (this._normalized !== null) {
            return this._normalized;
        }

        let text = this._.data;
        const opts = this._.options;

        // 共通パイプライン
        text = UnicodeContext.normalize(text);
        text = OsContext.normalize(text, opts.newline);

        if (opts.ja) {
            text = JapaneseContext.normalize(text);
        }

        // フォーマット別パイプライン
        switch (opts.type) {
            case 'jaml':
                text = JamlFormat.normalize(text);
                break;
            case 'html':
                text = HtmlFormat.normalize(text);
                break;
            default:
                break;
        }

        this._normalized = text;
        return text;
    }
}
