import { describe, test, expect } from "bun:test";
import { HeadingRule } from '../../src/rules/heading.js';

describe("HeadingRule", () => {
    test("見出し記法にマッチすること", () => {
        const rule = new HeadingRule();
        const match1 = rule.match("# Title");
        expect(match1).not.toBeNull();
        expect(match1[1]).toBe("#");
        expect(match1[2]).toBe("Title");
        expect(rule.match("####### Too Deep")).toBeNull();
    });
});

