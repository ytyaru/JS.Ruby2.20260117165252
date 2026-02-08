import { describe, test, expect } from "bun:test";
import { JapaneseRegExp } from '../src/main.js';

describe("JapaneseRegExp", () => {
    test("HIRAGANA_ONLY: ひらがなのみにマッチすること", () => {
        expect(JapaneseRegExp.HIRAGANA_ONLY.test("あいうえお")).toBe(true);
        expect(JapaneseRegExp.HIRAGANA_ONLY.test("あaい")).toBe(false);
        expect(JapaneseRegExp.HIRAGANA_ONLY.test("アイウエオ")).toBe(false);
    });

    test("KATAKANA_ONLY: カタカナのみにマッチすること", () => {
        expect(JapaneseRegExp.KATAKANA_ONLY.test("アイウエオ")).toBe(true);
        expect(JapaneseRegExp.KATAKANA_ONLY.test("アaイ")).toBe(false);
        expect(JapaneseRegExp.KATAKANA_ONLY.test("あいうえお")).toBe(false);
    });

    test("CJK_KANJI_ONLY: CJK漢字のみにマッチすること", () => {
        expect(JapaneseRegExp.CJK_KANJI_ONLY.test("日本語")).toBe(true);
        expect(JapaneseRegExp.CJK_KANJI_ONLY.test("日a本")).toBe(false);
        expect(JapaneseRegExp.CJK_KANJI_ONLY.test("日本ゴ")).toBe(false);
    });

    test("JAPANESE_GENERAL: 日本語の一般的な文字にマッチすること", () => {
        expect(JapaneseRegExp.JAPANESE_GENERAL.test("あ")).toBe(true);
        expect(JapaneseRegExp.JAPANESE_GENERAL.test("ア")).toBe(true);
        expect(JapaneseRegExp.JAPANESE_GENERAL.test("漢")).toBe(true);
        expect(JapaneseRegExp.JAPANESE_GENERAL.test("。")).toBe(true);
        expect(JapaneseRegExp.JAPANESE_GENERAL.test("a")).toBe(false);
    });
});

