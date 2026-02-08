export class JapaneseRegExp {
    // ※ JavaScriptの正規表現で Unicode Property Escapes を使用するため、
    // 全ての正規表現に 'u' フラグを付与しています。

    // --- 1. 日本ローカライズ分類 (部品としての正規表現) ---

    // 1. 平仮名 (合字 ゟ を含む)
    static HIRAGANA = /[\p{Script=Hiragana}ゟ]/u;

    // 2. 全角片仮名 (拡張、合字 ヿ を含む)
    static KATAKANA = /[\p{Script=Katakana}ヿ]/u;

    // 3. 半角片仮名 (JIS X 0201 範囲)
    static HALFWIDTH_KATAKANA = /[\uFF66-\uFF9F]/u;

    // 4. 変体仮名 (歴史的仮名)
    static HENTAIGANA = /[\u{1B000}-\u{1B16F}]/u;

    // 5. CJK漢字 (広義: 統合漢字 + 互換漢字 + 部首)
    // ※技術的制約により部首等が含まれる「一部採用」の状態
    static CJK_KANJI = /\p{Script=Han}/u;

    // 6. 漢字構成要素・部首 (サニタイズ用)
    static KANJI_STRUCTURE = /[\u2E80-\u2FDF\u2FF0-\u2FFB]/u;

    // 7. 漢文用記号 (サニタイズ用)
    static KANBUN_MARK = /[\u3190-\u319F]/u;

    // 8. 踊り字 (漢字用)
    static ODORIJI_KANJI = /[々〃]/u;

    // 9. 踊り字 (平仮名用)
    static ODORIJI_HIRAGANA = /[ゝゞ]/u;

    // 10. 踊り字 (片仮名用)
    static ODORIJI_KATAKANA = /[ヽヾ]/u;

    // 11. 踊り字 (縦書き用)
    static ODORIJI_VERTICAL = /[〻〱〲〳〴〵]/u;

    // 12. 合略仮名
    static GORYAKU_KANA = /[ゟヿ𪜈]/u;

    // 13. 助数詞用略字
    static ABBREVIATION_COUNTER = /[ヶヵ]/u;

    // 14. 記号的な略字
    static ABBREVIATION_SYMBOL = /[〆〼仝㍿]/u;

    // 15. 元号合字
    static ERA_NAME = /[㍾㍽㍼㍻㋿]/u;

    // 16. 単位合字
    static UNIT_SYMBOL = /[\u3300-\u3370]/u;

    // 17. 漢数字 (小字)
    static KANSUJI_SMALL = /[〇一二三四五六七八九十百千万億兆京垓秭穣溝澗正載極]/u;

    // 18. 漢数字 (大字)
    static KANSUJI_LARGE = /[零壱弐参肆伍陸漆捌玖拾陌佰阡仟萬]/u;

    // 19. 漢数字 (全種)
    static KANSUJI_ALL = /[〇一二三四五六七八九十百千万億兆京垓秭穣溝澗正載極零壱弐参肆伍陸漆捌玖拾陌佰阡仟萬]/u;

    // 20. 準漢字・準仮名 (ルビ親文字判定の核)
    // 々 〇 ヶ ヵ 〆 〻 〼 仝 𪜈 〃 〱 〲 〳 〴 〵 ゟ ヿ
    static SEMI_KANJI = /[々〇ヶヵ〆〻〼仝𪜈〃〱〲〳〴〵ゟヿ]/u;

    // 21. 句読点・括弧・記号 (全角)
    static PUNCTUATION = /[\u3000-\u303F！-／：-＠［-｀｛-～]/u;

    // 22. 半角記号 (全角化対象)
    static HALFWIDTH_PUNCTUATION = /[\uFF61-\uFF65]/u;

    // 23. 縦書き専用文字 (変形記号等)
    static VERTICAL_ONLY = /[\uFE10-\uFE19\uFE30-\uFE4F]/u;

    // 24. ラテン文字・英数字 (全角・半角)
    static ALPHANUMERIC = /[A-Za-z0-9Ａ-Ｚａ-ｚ０-９]/u;

    // 25. 結合文字 (NFC保護対象)
    static COMBINING_MARK = /\p{M}/u;


    // --- 2. Jaml要件分類 (複合正規表現) ---

    // A. ルビ親文字 (漢字)
    // CJK漢字 または 準漢字・準仮名
    static RUBY_PARENT_KANJI = new RegExp(`${JapaneseRegExp.CJK_KANJI.source}|${JapaneseRegExp.SEMI_KANJI.source}`, 'u');

    // B. 正規化保護対象
    // CJK漢字 または 結合文字 または 変体仮名
    static NFC_UNSAFE = new RegExp(`${JapaneseRegExp.CJK_KANJI.source}|${JapaneseRegExp.COMBINING_MARK.source}|${JapaneseRegExp.HENTAIGANA.source}`, 'u');
}

