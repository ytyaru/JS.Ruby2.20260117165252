import { describe, test, expect } from "bun:test";
import { HeadingRule } from '../src/rules/heading.js';
import { PageBreakRule } from '../src/rules/page-break.js';
import { ThematicBreakRule } from '../src/rules/thematic-break.js';
import { PartRule } from '../src/rules/part.js';

describe("Block Rules", () => {
    test("HeadingRule", () => {
        const rule = new HeadingRule();
        
        // マッチする場合
        const match1 = rule.match("# Title");
        expect(match1).not.toBeNull();
        expect(match1[1]).toBe("#"); // level
        expect(match1[2]).toBe("Title"); // content

        const match2 = rule.match("###   Sub Title  ");
        expect(match2).not.toBeNull();
        expect(match2[1]).toBe("###");
        expect(match2[2]).toBe("Sub Title  ");

        // マッチしない場合
        expect(rule.match("NoSharp")).toBeNull();
        expect(rule.match("#NoSpace")).toBeNull(); // スペース必須
    });

    test("PageBreakRule", () => {
        const rule = new PageBreakRule();
        expect(rule.match("==========")).not.toBeNull(); // 10個
        expect(rule.match("=============")).not.toBeNull(); // 13個
        expect(rule.match("=========")).toBeNull(); // 9個
    });

    test("ThematicBreakRule", () => {
        const rule = new ThematicBreakRule();
        expect(rule.match("=====")).not.toBeNull(); // 5個
        expect(rule.match("==========")).not.toBeNull(); // 10個 (正規表現上はマッチする)
        expect(rule.match("====")).toBeNull(); // 4個
    });

    test("PartRule", () => {
        const rule = new PartRule();
        const match = rule.match("part: path/to/file.jaml");
        expect(match).not.toBeNull();
        expect(match[1]).toBe(" path/to/file.jaml");
        
        expect(rule.match("part")).toBeNull();

        // スペースあり
        const match1 = rule.match("part: ./file.jaml");
        expect(match1).not.toBeNull();
        expect(match1[1]).toBe(" ./file.jaml"); // スペース込みでキャプチャされる

        // スペースなし
        const match2 = rule.match("part:./file.jaml");
        expect(match2).not.toBeNull();
        expect(match2[1]).toBe("./file.jaml");
    });
});

