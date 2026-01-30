import { expect, test, describe } from "bun:test";
import { InvisibleChars } from "./invisible-chars.js";

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

