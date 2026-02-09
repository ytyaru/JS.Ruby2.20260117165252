import { describe, test, expect } from "bun:test";
import { JapaneseSanitizer } from '../src/main.js';

describe("JapaneseSanitizer", () => {
    test("デフォルトでは入力をそのまま返すこと（スタブ状態）", () => {
        const input = "テスト文字列";
        expect(JapaneseSanitizer.sanitize(input)).toBe(input);
    });

    test("空文字の処理", () => {
        expect(JapaneseSanitizer.sanitize("")).toBe("");
        expect(JapaneseSanitizer.sanitize(null)).toBe("");
    });

    test("オプションを指定してもエラーにならないこと", () => {
        const input = "漢字\u2FF0構成";
        const options = {
            structure: 'remove',
            kanbun: 'replace'
        };
        // 現状はスタブなので入力がそのまま返る
        expect(JapaneseSanitizer.sanitize(input, options)).toBe(input);
    });
});

