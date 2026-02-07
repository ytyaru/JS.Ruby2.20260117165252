import { describe, test, expect } from "bun:test";
import { ThematicBreakRule } from '../../src/rules/thematic-break.js';

describe("ThematicBreakRule", () => {
    test("主題区切り記法にマッチすること", () => {
        const rule = new ThematicBreakRule();
        
        // 正常系 (5個〜9個)
        expect(rule.match("=====")).not.toBeNull();      // 5個
        expect(rule.match("=========")).not.toBeNull();  // 9個
        
        // 異常系 (4個以下、または10個以上)
        expect(rule.match("====")).toBeNull();           // 4個
        expect(rule.match("==========")).toBeNull();     // 10個 (PageBreak)
    });
});

