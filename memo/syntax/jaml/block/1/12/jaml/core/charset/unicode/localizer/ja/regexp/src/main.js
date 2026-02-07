export class JapaneseRegExp {
    // ひらがな (U+3040 - U+309F)
    static HIRAGANA = /[\u3040-\u309F]/;
    static HIRAGANA_ONLY = /^[\u3040-\u309F]+$/;

    // カタカナ (U+30A0 - U+30FF)
    static KATAKANA = /[\u30A0-\u30FF]/;
    static KATAKANA_ONLY = /^[\u30A0-\u30FF]+$/;

    // CJK統合漢字 (U+4E00 - U+9FFF)
    // ※これは中国語、韓国語の漢字も含むため「日本語の漢字」ではない
    static CJK_KANJI = /[\u4E00-\u9FFF]/;
    static CJK_KANJI_ONLY = /^[\u4E00-\u9FFF]+$/;

    // 日本語で使われる記号・句読点など (一部)
    static JAPANESE_PUNCTUATION = /[、。々〇〡-〯〱-〵〸-〺]/;

    // 一般的な日本語の文字（ひらがな、カタカナ、漢字、記号）
    static JAPANESE_GENERAL = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF、。々〇〡-〯〱-〵〸-〺]/;
    static JAPANESE_GENERAL_ONLY = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF、。々〇〡-〯〱-〵〸-〺]+$/;
}

