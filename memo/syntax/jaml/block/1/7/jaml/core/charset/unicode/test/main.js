import { describe, test, expect } from "bun:test";
import { Unicode } from '../src/main.js';

describe("Unicode", () => {
    test("NULLバイトが削除されること", () => {
        const input = "Hello\0World";
        const expected = "HelloWorld";
        expect(Unicode.normalize(input)).toBe(expected);
    });

    test("通常のテキストはそのまま返されること", () => {
        const input = "こんにちはWorld";
        expect(Unicode.normalize(input)).toBe(input);
    });

    test("空文字の処理", () => {
        expect(Unicode.normalize("")).toBe("");
        expect(Unicode.normalize(null)).toBe("");
    });
});
