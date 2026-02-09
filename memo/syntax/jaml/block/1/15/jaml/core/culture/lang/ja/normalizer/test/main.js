import { describe, test, expect } from "bun:test";
import { JapaneseNormalizer } from '../src/main.js';

describe("JapaneseNormalizer", () => {
    test("デフォルトでは入力をそのまま返すこと（スタブ状態）", () => {
        const input = "テスト文字列";
        expect(JapaneseNormalizer.normalize(input)).toBe(input);
    });

    test("空文字の処理", () => {
        expect(JapaneseNormalizer.normalize("")).toBe("");
        expect(JapaneseNormalizer.normalize(null)).toBe("");
    });

    test("オプションを指定してもエラーにならないこと", () => {
        const input = "テスト";
        const options = {
            nfc: true,
            dakuten: 'nfc',
            width: 'full',
            kansuji: 'small'
        };
        // 現状はスタブなので入力がそのまま返る
        expect(JapaneseNormalizer.normalize(input, options)).toBe(input);
    });
});

