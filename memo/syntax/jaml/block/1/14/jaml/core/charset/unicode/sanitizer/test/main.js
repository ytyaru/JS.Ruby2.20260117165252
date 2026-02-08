import { describe, test, expect } from "bun:test";
import { Sanitizer } from '../src/main.js';

describe("Unicode Sanitizer", () => {
    test("ヌルバイトが削除されること", () => {
        const input = "Hello\0World";
        const expected = "HelloWorld";
        expect(Sanitizer.sanitize(input)).toBe(expected);
    });

    test("ヌルバイトが複数あっても全て削除されること", () => {
        const input = "\0Test\0\0String\0";
        const expected = "TestString";
        expect(Sanitizer.sanitize(input)).toBe(expected);
    });

    test("ヌルバイトを含まない文字列は変更されないこと", () => {
        const input = "Clean string";
        expect(Sanitizer.sanitize(input)).toBe(input);
    });

    test("空文字やnullを安全に処理すること", () => {
        expect(Sanitizer.sanitize("")).toBe("");
        expect(Sanitizer.sanitize(null)).toBe("");
        expect(Sanitizer.sanitize(undefined)).toBe("");
    });
});

