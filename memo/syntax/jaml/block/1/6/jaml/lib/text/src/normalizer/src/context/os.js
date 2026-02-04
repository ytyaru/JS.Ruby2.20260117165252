// 相対パスでJamlErrorをインポート (構造依存)
import { JamlError } from '../../../../../../error/src/main.js';

export class OsContext {
    /**
     * 改行コードの統一
     * @param {string} text
     * @param {string} newline - 統一する改行コード (default: '\n')
     * @returns {string}
     */
    static normalize(text, newline = '\n') {
        if (!text) return '';

        // バリデーション
        if (newline !== '\n' && newline !== '\r\n') {
            throw new JamlError(`正規化不正。改行コードは\\nまたは\\r\\nのいずれかであるべきです。:${newline}`);
        }

        // ケース1: LFへの統一
        if (newline === '\n') {
            if (!text.includes('\r')) return text;
            return text.replace(/\r\n|\r/g, '\n');
        }

        // ケース2: CRLFへの統一
        const lfText = text.includes('\r') ? text.replace(/\r\n|\r/g, '\n') : text;
        return lfText.replace(/\n/g, newline);
    }
}

