import { Sanitizer } from '../../sanitizer/src/main.js';
import { Normalizer } from '../../normalizer/src/main.js';

export class Unicode {
    /**
     * テキストのサニタイズと基本正規化を行う
     * @param {string} text 
     * @returns {string}
     */
    static normalize(text) {
        if (!text) return '';
        
        // 1. サニタイズ (ヌルバイト除去)
        let result = Sanitizer.sanitize(text);
        
        // 2. 正規化 (NFC - 現状は無効化されているが呼び出す)
        result = Normalizer.normalize(result);
        
        return result;
    }
}

