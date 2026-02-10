import { describe, test, expect } from "bun:test";
import { Unicode } from '../src/main.js';

describe("Unicode API", () => {
    test("サニタイズと正規化が統合されていること", () => {
        // ヌルバイト(Sanitizer) + 通常文字
        const input = "Hello\0World";
        const expected = "HelloWorld";
        expect(Unicode.normalize(input)).toBe(expected);
    });
});

