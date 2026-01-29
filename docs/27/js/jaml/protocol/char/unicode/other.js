// jaml/protocol/char/unicode/other.js

import { CharGroup } from '../char-group.js';

// UnicodeData.txt から \p{...} で参照可能な文字群を生成するヘルパー関数
// (実際にはこの処理はビルド時に行うか、専用ライブラリを使うのが望ましいが、
// ここでは概念を示すための簡易的な実装)
function createCharGroupFromUnicodeProperty(property, label) {
    // 本来は全Unicode文字をループして判定する必要があるが、
    // 正規表現の \p{} を使えば、コンストラクタに渡すための文字列を生成できる。
    // しかし、CharGroupのコンストラクタはコードポイントを期待するため、
    // ここでは概念的なコードを示すに留める。
    // 実際の文字リストは、ビルドスクリプト等で事前生成するのが現実的。
    
    // 今回は、我々が既に特定した文字を手動で定義する。
    // 将来的には、この部分を自動生成に置き換える。
}

// --- C: Other ---
class Other {
    /** Other, Control (Cc) */
    static #Cc = new CharGroup(
        [[0x00, 0x1F], [0x7F, 0x9F]], 
        { ja: '制御文字', en: 'Control' }
    );
    static get Cc() { return this.#Cc; }

    /** Other, Format (Cf) */
    static #Cf = new CharGroup(
        [0x00AD, 0x061C, 0x180E, 0x200B, 0x200C, 0x200D, 0x200E, 0x200F, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0x206A, 0x206B, 0x206C, 0x206D, 0x206E, 0x206F],
        { ja: 'フォーマット文字', en: 'Format' }
    );
    static get Cf() { return this.#Cf; }

    // ... Cs, Co, Cn も同様に定義 ...

    /** Other (C) - すべての "Other" カテゴリを統合したもの */
    static #C = new CharGroup(
        [...this.Cc.items, ...this.Cf.items /* , ... */],
        { ja: 'その他', en: 'Other' }
    );
    static get C() { return this.#C; }
}

export const OtherChars = Other;

