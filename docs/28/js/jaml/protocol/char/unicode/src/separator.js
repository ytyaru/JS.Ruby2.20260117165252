// jaml/protocol/char/unicode/separator.js

import { CharGroup } from '../../char-group.js';

class Separator {
    /** Separator, Space (Zs) */
    static #Zs = new CharGroup(
        [0x0020, 0x00A0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000],
        { ja: 'スペース区切り', en: 'Space Separator' }
    );
    static get Zs() { return this.#Zs; }

    /** Separator, Line (Zl) */
    static #Zl = new CharGroup(
        [0x2028],
        { ja: '行区切り', en: 'Line Separator' }
    );
    static get Zl() { return this.#Zl; }

    /** Separator, Paragraph (Zp) */
    static #Zp = new CharGroup(
        [0x2029],
        { ja: '段落区切り', en: 'Paragraph Separator' }
    );
    static get Zp() { return this.#Zp; }

    /** Separator (Z) - すべての "Separator" カテゴリを統合したもの */
    static #Z = new CharGroup(
        [...this.Zs.items, ...this.Zl.items, ...this.Zp.items],
        { ja: '区切り文字', en: 'Separator' }
    );
    static get Z() { return this.#Z; }
}

export const SeparatorChars = Separator;
