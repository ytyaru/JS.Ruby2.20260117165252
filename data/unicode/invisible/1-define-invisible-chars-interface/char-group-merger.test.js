import { expect, test, describe } from "bun:test";
import { CharGroup } from "./char-group.js";
import { CharGroupLarge } from "./char-group-large.js";
import { CharGroupMerger } from "./char-group-merger.js";

// テスト用データの準備
const MetaChars = new CharGroup('｜《》', { ja: 'メタ文字', en: 'MetaChars' });

// 前回の不可視文字（サブセットとして一部のみ定義）
const InvisibleCharsLarge = new CharGroupLarge(
    [[0x0000, 0x0020], 0x200B], 
    { ja: '不可視文字', en: 'InvisibleChars' }
);

describe("CharGroupMerger 結合テスト", () => {

    test("CharGroup と CharGroupLarge を正常にマージできるか", () => {
        const merged = CharGroupMerger.merge(
            [MetaChars, InvisibleCharsLarge],
            { ja: '結合テスト', en: 'MergeTest' }
        );

        expect(merged).toBeInstanceOf(CharGroupLarge);
        
        // メタ文字が含まれているか
        expect(merged.has("｜")).toBe(true);
        expect(merged.has("《")).toBe(true);
        
        // 不可視文字（Large由来）が含まれているか
        expect(merged.has("\u200B")).toBe(true);
        expect(merged.has("\0")).toBe(true);

        // 正常な文字は含まれないか
        expect(merged.has("あ")).toBe(false);
    });

    test("マージ後の remove が正しく動作するか", () => {
        const merged = CharGroupMerger.merge([MetaChars, InvisibleCharsLarge]);
        const input = "｜《あ》\u200Bい";
        // ｜, 《, 》, \u200B が削除されるはず
        expect(merged.remove(input)).toBe("あい");
    });

    test("不正な型が含まれている場合に TypeError を投げるか", () => {
        const invalidData = [
            MetaChars,
            { name: "not a group instance" }, // 不正なオブジェクト
        ];

        expect(() => {
            CharGroupMerger.merge(invalidData);
        }).toThrow(TypeError);

        try {
            CharGroupMerger.merge(invalidData);
        } catch (e) {
            // メッセージ内容の厳密なチェック
            expect(e.message).toContain("配列要素の型が違います。");
            expect(e.message).toContain("Object"); // 実際の型名が表示されているか
        }
    });

    test("数値や文字列を直接渡した場合も例外を投げるか", () => {
        expect(() => {
            CharGroupMerger.merge([MetaChars, "not-a-group"]);
        }).toThrow(/String/); // actualType に String が含まれるはず
    });
});

