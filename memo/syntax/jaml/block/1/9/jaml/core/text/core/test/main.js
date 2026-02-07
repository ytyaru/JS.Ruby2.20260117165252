import { describe, test, expect } from "bun:test";
import { Text } from '../src/main.js';
import { JamlError } from '../../../error/src/main.js';

describe("Text", () => {
    test("正規化: 改行コードがLFに統一されること", () => {
        const input = "Line1\r\nLine2\rLine3";
        const text = new Text(input);
        expect(text.content).toBe("Line1\nLine2\nLine3");
    });

    test("正規化: NULLバイトが削除されること (Unicode連携)", () => {
        const input = "Hello\0World";
        const text = new Text(input);
        expect(text.content).toBe("HelloWorld");
    });

    test("getRowCol: 正しい行列が取得できること", () => {
        const input = "AB\nCD"; // index: A=0, B=1, \n=2, C=3, D=4
        const text = new Text(input);
        
        const [r1, c1] = text.getRowCol(3); // 'C'
        expect(r1).toBe(1);
        expect(c1).toBe(0);

        const [r2, c2] = text.getRowCol(2); // '\n'
        expect(r2).toBe(0);
        expect(c2).toBe(2);
    });

    test("getRowCol: 範囲外アクセスでエラーになること", () => {
        const text = new Text("A");
        expect(() => text.getRowCol(10)).toThrow(JamlError);
    });

    test("getIndex: 正しいインデックスが取得できること", () => {
        const input = "AB\nCD";
        const text = new Text(input);
        
        expect(text.getIndex(1, 0)).toBe(3); // 'C'
    });

    test("getIndex: 範囲外アクセスでエラーになること", () => {
        const text = new Text("A");
        expect(() => text.getIndex(5, 0)).toThrow(JamlError);
    });
});
