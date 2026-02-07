import { describe, test, expect } from "bun:test";
import { ParagraphRule } from '../../src/rules/paragraph.js';

describe("ParagraphRule", () => {
    test("通常のテキスト行にマッチすること", () => {
        const rule = new ParagraphRule();
        
        expect(rule.match("Hello World")).not.toBeNull();
        expect(rule.match("日本語のテキスト")).not.toBeNull();
        expect(rule.match("  インデントあり")).not.toBeNull();
    });

    test("空行や空白のみの行にはマッチしないこと", () => {
        const rule = new ParagraphRule();
        
        expect(rule.match("")).toBeNull();       // 空文字
        expect(rule.match("   ")).toBeNull();    // スペースのみ
        expect(rule.match("\t")).toBeNull();     // タブのみ
    });
});

