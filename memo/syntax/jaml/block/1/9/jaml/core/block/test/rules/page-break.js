import { describe, test, expect } from "bun:test";
import { PageBreakRule } from '../../src/rules/page-break.js';

describe("PageBreakRule", () => {
    test("改ページ記法にマッチすること", () => {
        const rule = new PageBreakRule();
        
        // 正常系 (10個以上)
        expect(rule.match("==========")).not.toBeNull();
        expect(rule.match("===============")).not.toBeNull();

        // 異常系 (9個以下)
        expect(rule.match("=========")).toBeNull();
    });
});

