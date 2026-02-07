import { describe, test, expect } from "bun:test";
import { Normalizer } from '../src/main.js';

describe("Unicode Normalizer", () => {
    test("現状は入力をそのまま返すこと（NFC無効化のため）", () => {
        // 本来 NFC で "が" (U+304C) になるはずの文字列
        const input = "\u304B\u3099"; // か + ゛
        
        // 無効化されているため、入力と同じままであることを確認
        expect(Normalizer.normalize(input, 'NFC')).toBe(input);
    });

    test("CJK統合漢字の異体字が変更されないこと", () => {
        // 神の異体字 (U+FA19)
        const input = "\uFA19";
        
        // normalize('NFC') をかけると "神" (U+795E) になってしまうが、
        // 無効化されているため変更されないことを確認
        expect(Normalizer.normalize(input, 'NFC')).toBe(input);
    });

    test("空文字やnullを安全に処理すること", () => {
        expect(Normalizer.normalize("")).toBe("");
        expect(Normalizer.normalize(null)).toBe("");
    });
});

