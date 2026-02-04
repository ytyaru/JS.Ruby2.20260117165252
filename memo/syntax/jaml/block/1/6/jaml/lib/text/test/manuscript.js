import { describe, test, expect } from "bun:test";
import { Manuscript } from '../src/manuscript.js';
import { OsContext } from '../src/normalizer/src/context/os.js';
import { JamlError } from '../../error/src/main.js';

describe("Manuscript", () => {
    test("正規化: NULLバイト削除と改行統一", () => {
        const rawText = "Hello\r\nWorld\0";
        const ms = new Manuscript(rawText);
        expect(ms.text).toBe("Hello\nWorld");
    });

    test("TextIndex: 行・列の取得", () => {
        const text = "Hello\nWorld";
        const ms = new Manuscript(text);
        const [row, col] = ms.getRowCol(6);
        expect(row).toBe(1);
        expect(col).toBe(0);
    });

    test("TextIndex: インデックスの取得", () => {
        const text = "Hello\nWorld";
        const ms = new Manuscript(text);
        const index = ms.getIndex(1, 0);
        expect(index).toBe(6);
    });

    test("TextIndex: 範囲外アクセスでエラー (getRowCol)", () => {
        const ms = new Manuscript("abc");
        expect(() => {
            ms.getRowCol(100);
        }).toThrow(JamlError);
        
        try {
            ms.getRowCol(100);
        } catch (e) {
            expect(e.message).toContain("範囲外です。index:100");
        }
    });

    test("TextIndex: 範囲外アクセスでエラー (getIndex)", () => {
        const ms = new Manuscript("abc");
        expect(() => {
            ms.getIndex(10, 0); // 存在しない行
        }).toThrow(JamlError);

        try {
            ms.getIndex(10, 0);
        } catch (e) {
            expect(e.message).toContain("範囲外です。row:10,col:0");
        }
    });
});

describe("OsContext (Validation)", () => {
    test("不正な改行コード指定でJamlErrorが発生すること", () => {
        expect(() => {
            OsContext.normalize("text", "<br>");
        }).toThrow(JamlError);
    });
});

