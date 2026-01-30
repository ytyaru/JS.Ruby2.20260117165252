import { expect, test, describe } from "bun:test";
import { CharGroup } from "./char-group.js";
import { InvisibleChars } from "./invisible-chars.js";

// テスト用データの準備
const MetaChars = new CharGroup('｜《》', { ja: 'メタ文字', en: 'MetaChars' });

describe("CharGroup (InvisibleChars) 負荷・動作テスト", () => {
    
    test("初期化と正規表現の生成がエラーなく完了するか", () => {
        // regexp ゲッターを呼び出して正規表現をコンパイルさせる
        const re = InvisibleChars.regexp;
        expect(re).toBeInstanceOf(RegExp);
        console.log(`文字数: ${InvisibleChars.items.length}`);
        console.log(`正規表現の長さ: ${re.source.length} 文字`);
    });

    test("不可視文字の削除 (remove) が動作するか", () => {
        const input = "A\u200B\u0000B\tC　D"; // ゼロ幅、Null、タブ、全角スペース
        const result = InvisibleChars.remove(input);
        
        // スペース(0x20)も抽出条件に含まれている場合、ABCDのみ残る
        expect(result).toBe("ABCD");
    });

    test("大量のテキストに対するパフォーマンス計測", () => {
        const largeText = "あ".repeat(10000) + "\u200B" + "い".repeat(10000);
        
        const start = performance.now();
        const cleaned = InvisibleChars.remove(largeText);
        const end = performance.now();
        
        console.log(`処理時間: ${(end - start).toFixed(4)}ms`);
        expect(cleaned).not.toContain("\u200B");
    });

    test("正規表現の最大文字クラス制限の確認", () => {
        // 非常に長い正規表現で test() がクラッシュしないか
        const longText = "Normal Text with Invisible \u0007 Char";
        expect(() => {
            InvisibleChars.has(longText);
        }).not.toThrow();
    });
});

describe("CharGroup merge()", () => {
    test("CharGroup と CharGroup を正常にマージできるか", () => {
        const merged = CharGroup.merge(
            [MetaChars, InvisibleChars],
            { ja: 'メタと不可視の文字', en: 'Meta and Invisible chars' }
        );

        expect(merged).toBeInstanceOf(CharGroup);
        
        // メタ文字が含まれているか
        expect(merged.has("｜")).toBe(true);
        expect(merged.has("《")).toBe(true);
        
        // 不可視文字が含まれているか
        expect(merged.has("\u200B")).toBe(true);
        expect(merged.has("\0")).toBe(true);

        // 正常な文字は含まれないか
        expect(merged.has("あ")).toBe(false);
    });

    test("マージ後の remove が正しく動作するか", () => {
        const merged = CharGroup.merge([MetaChars, InvisibleChars]);
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
            CharGroup.merge(invalidData);
        }).toThrow(TypeError);

        try {
            CharGroup.merge(invalidData);
        } catch (e) {
            // メッセージ内容の厳密なチェック
            expect(e.message).toContain("配列要素の型が違います。");
            expect(e.message).toContain("Object"); // 実際の型名が表示されているか
        }
    });

    test("数値や文字列を直接渡した場合も例外を投げるか", () => {
        expect(() => {
            CharGroup.merge([MetaChars, "not-a-group"]);
        }).toThrow(/String/); // actualType に String が含まれるはず
    });
});


