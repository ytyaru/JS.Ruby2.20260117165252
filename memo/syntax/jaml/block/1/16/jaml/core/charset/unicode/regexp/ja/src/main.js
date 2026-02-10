import { JamlError } from '../../../../../error/src/main.js';
/**
 * 文字種カテゴリの基底クラス。
 * 配列の配列形式による順序保持、厳格な命名規則（大文字スネークケース）の強制、
 * および遅延評価による ALL 正規表現の生成を行う。
 */
class Category {
    /**
     * @param {Array.<[string, RegExp]>} items - [名前, 正規表現] の配列の配列。名前は 'HIRA_KANA' 形式。
     */
    constructor(items) {
        this._items = items;
        this._allCache = null;

        for (const [name, pattern] of items) {
            // 命名規則のバリデーション: 大文字、数字、アンダーバーのみ許可
            if (!/^[A-Z0-9_]+$/.test(name)) {
                throw new JamlError(
                    `不適切なプロパティ名です: "${name}"。プロパティ名は最初から大文字のスネークケース（例: KANJI_ALL）で記述してください。`
                );
            }

            Object.defineProperty(this, name, {
                value: pattern,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }
    }

    /**
     * カテゴリに含まれる全ての正規表現の論理和（OR）を返す。
     * @returns {RegExp}
     */
    get ALL() {
        if (this._allCache === null) {
            if (this._items.length === 0) {
                this._allCache = /(?!)/u;
            } else {
                const combinedSource = this._items.map(([_, pattern]) => pattern.source).join('|');
                this._allCache = new RegExp(combinedSource, 'u');
            }
        }
        return this._allCache;
    }
}
/**
 * 1. 仮名 (KANA) カテゴリ
 * 平仮名、片仮名（全角・半角）、変体仮名を網羅する。
 */
const KANA = new Category([
    // 平仮名 (ぁ-ゔ、ゕ、ゖ、合字 ゟ を含む)
    ['HIRA', /[\p{Script=Hiragana}ゟ]/u],
    // 全角片仮名 (ァ-ヴ、ヵ、ヶ、拡張、合字 ヿ を含む)
    ['KATA', /[\p{Script=Katakana}ヿ]/u],
    // 半角片仮名 (JIS X 0201 範囲)
    ['HAN', /[\uFF66-\uFF9F]/u],
    // 変体仮名 (歴史的仮名)
    ['HEN', /[\u{1B000}-\u{1B16F}]/u]
]);

/**
 * 2. 漢字系 (KANJI) カテゴリ
 * CJK漢字（広義）、部首・構成要素、漢文用記号を網羅する。
 */
const KANJI = new Category([
    // CJK漢字 (広義: 統合漢字 + 互換漢字 + 部首)
    // ※技術的制約により部首等が含まれる「一部採用」の状態
    ['CJK', /\p{Script=Han}/u],
    // 漢字構成要素・部首 (CJK部首補助、康煕部首、漢字構成記述文字)
    ['STRUCTURE', /[\u2E80-\u2FDF\u2FF0-\u2FFB]/u],
    // 漢文用記号 (レ点、一二三点等)
    ['KANBUN', /[\u3190-\u319F]/u]
]);

/**
 * 3. 踊り字 (ODORIJI) カテゴリ
 * 漢字用、平仮名用、片仮名用、および縦書き用の反復記号を網羅する。
 */
const ODORIJI = new Category([
    // 漢字用踊り字 (々、〃)
    ['KANJI', /[々〃]/u],
    // 平仮名用踊り字 (ゝ、ゞ)
    ['HIRA', /[ゝゞ]/u],
    // 片仮名用踊り字 (ヽ、ヾ)
    ['KATA', /[ヽヾ]/u],
    // 縦書き用踊り字 (〻、および くの字点 〱〲〳〴〵)
    ['VERTICAL', /[〻〱〲〳〴〵]/u]
]);
/**
 * 4. 略字・合字 (ABBREVIATION) カテゴリ
 * 合略仮名、助数詞用略字、記号的な略字、元号、単位を網羅する。
 */
const ABBREVIATION = new Category([
    // 合略仮名 (より、コト、とも)
    ['KANA', /[ゟヿ\u{2A708}]/u],
    // 助数詞用略字 (ヶ、ヵ)
    ['COUNTER', /[ヶヵ]/u],
    // 記号的な略字 (〆、〼、仝、㍿、〃)
    ['SYMBOL', /[〆〼仝㍿〃]/u],
    // 元号合字 (明治、大正、昭和、平成、令和)
    ['ERA', /[㍾㍽㍼㍻㋿]/u],
    // 単位合字 (キロ、メートル等、U+3300-U+3370 範囲)
    ['UNIT', /[\u3300-\u3370]/u]
]);
/**
 * 5. 漢数字 (KANSUJI) カテゴリ
 * 小字（〇を含む）と、網羅的な大字（異体字を含む）を定義する。
 * ※「円」「圓」は助数詞であり数字ではないため、本カテゴリからは除外する。
 */
const KANSUJI = new Category([
    // 漢数字 (小字: 〇、一-九、十、百、千、万-極)
    ['SMALL', /[〇一二三四五六七八九十百千万億兆京垓秭穣溝澗正載極]/u],
    // 漢数字 (大字: 零、壱-萬)
    // 壱(壹,弌), 弐(貳,貮,弍), 参(參,弎), 肆(泗), 拾(什), 佰(陌), 阡(仟), 萬
    ['LARGE', /[零壱壹弌弐貳貮弍参參弎肆泗伍陸漆質捌玖拾什佰陌阡仟萬]/u]
]);

/**
 * 6. 準漢字・準仮名 (SEMI_KANJI) カテゴリ
 * 漢字や仮名に準じて扱われ、ルビ親文字判定の核となる文字群。
 */
const SEMI_KANJI = new Category([
    // 準漢字・準仮名の全リスト (17文字)
    // 々 〇 ヶ ヵ 〆 〻 〼 仝 𪜈 〃 〱 〲 〳 〴 〵 ゟ ヿ
    ['CORE', /[々〇ヶヵ〆〻〼仝\u{2A708}〃〱〲〳〴〵ゟヿ]/u]
]);
/**
 * 7. 記号・他 (SYMBOL) カテゴリ
 * 全角記号、半角記号（全角化対象）、縦書き専用変形記号を網羅する。
 */
const SYMBOL = new Category([
    // 句読点・括弧・記号 (全角: CJK記号ブロック + 一般全角記号)
    ['FULL', /[\u3000-\u303F！-／：-＠［-｀｛-～]/u],
    // 半角記号 (｡ , ･ ｢ ｣)
    ['HALF', /[\uFF61-\uFF65]/u],
    // 縦書き専用文字 (変形句読点、変形括弧、傍点等)
    ['VERTICAL', /[\uFE10-\uFE19\uFE30-\uFE4F]/u]
]);

/**
 * 8. その他 (OTHER) カテゴリ
 * 英数字、結合文字を網羅する。
 */
const OTHER = new Category([
    // ラテン文字・英数字 (全角・半角)
    ['ALPHANUMERIC', /[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]/u],
    // 結合文字 (濁点・半濁点、ダイアクリティカルマーク)
    ['COMBINING', /\p{M}/u]
]);

/**
 * 9. Jaml要件 (JAML) カテゴリ
 * 日本ローカライズ分類の部品を組み合わせた、Jamlの機能用定義。
 */
const JAML = new Category([
    // ルビ親文字 (漢字): CJK漢字 + 準漢字・準仮名
    ['RUBY_PARENT_KANJI', new RegExp(`${KANJI.CJK.source}|${SEMI_KANJI.CORE.source}`, 'u')],
    // 正規化保護対象: CJK漢字 + 結合文字 + 変体仮名
    ['NFC_UNSAFE', new RegExp(`${KANJI.CJK.source}|${OTHER.COMBINING.source}|${KANA.HEN.source}`, 'u')]
]);
/**
 * 日本ローカライズ部品の名前空間オブジェクト。
 * 外部から変更できないようフリーズし、メモリ効率のために一度だけ生成する。
 */
const JA_NAMESPACE = Object.freeze({
    KANA: KANA,
    KANJI: KANJI,
    ODORIJI: ODORIJI,
    ABBREVIATION: ABBREVIATION,
    KANSUJI: KANSUJI,
    SEMI_KANJI: SEMI_KANJI,
    SYMBOL: SYMBOL,
    OTHER: OTHER,
});
/**
 * 日本語の文字集合に関連する正規表現を統括するファサードクラス。
 */
export class JapaneseRegExp {
    /**
     * 日本ローカライズ分類（部品層）へのアクセスを提供。
     * @returns {Object} フリーズされた名前空間オブジェクト
     */
    static get JA() {
        return JA_NAMESPACE;
    }

    /**
     * Jaml要件分類（機能層）へのアクセスを提供。
     * JAML自体が Category インスタンスであり、内部でプロパティが保護されているため、
     * そのまま返しても安全かつ効率的。
     * @returns {Category}
     */
    static get JAML() {
        return JAML;
    }
}

