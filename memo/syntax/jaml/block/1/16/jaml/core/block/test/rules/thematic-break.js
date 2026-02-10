import { describe, test, expect } from "bun:test";
import { ThematicBreakRule } from '../../src/rules/thematic-break.js';

describe("ThematicBreakRule", () => {
    test("主題区切り(Thematic Break)記法にマッチすること", () => {
        const rule = new ThematicBreakRule();
        expect(rule.match("=====")).not.toBeNull();
        expect(rule.match("=========")).not.toBeNull();
        expect(rule.match("==========")).toBeNull(); // 10個はPageBreak
    });
});

