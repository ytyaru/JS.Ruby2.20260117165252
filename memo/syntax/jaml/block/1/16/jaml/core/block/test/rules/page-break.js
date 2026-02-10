import { describe, test, expect } from "bun:test";
import { PageBreakRule } from '../../src/rules/page-break.js';

describe("PageBreakRule", () => {
    test("改ページ記法にマッチすること", () => {
        const rule = new PageBreakRule();
        expect(rule.match("==========")).not.toBeNull();
        expect(rule.match("===============")).not.toBeNull();
        expect(rule.match("=========")).toBeNull();
    });
});

