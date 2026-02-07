import { describe, test, expect } from "bun:test";
import { HeadingRule } from '../../src/rules/heading.js';

describe("HeadingRule", () => {
    test("見出し記法にマッチすること", () => {
        const rule = new HeadingRule();
        
        // 正常系
        const match1 = rule.match("# Title");
        expect(match1).not.toBeNull();
        expect(match1[1]).toBe("#");
        expect(match1[2]).toBe("Title");

        const match2 = rule.match("###### Deep Heading");
        expect(match2).not.toBeNull();
        expect(match2[1]).toBe("######");

        // 異常系
        expect(rule.match("####### Too Deep")).toBeNull(); // 7個は不可
        expect(rule.match("#NoSpace")).toBeNull(); // スペース必須
        expect(rule.match("Not Heading")).toBeNull();
    });
});

