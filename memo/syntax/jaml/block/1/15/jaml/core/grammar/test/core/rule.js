import { describe, test, expect } from "bun:test";
import { GrammarRule } from '../../src/core/rule.js';

describe("GrammarRule", () => {
    test("マッチングが動作すること", () => {
        const rule = new GrammarRule('test', /abc/);
        expect(rule.match('abc')).not.toBeNull();
        expect(rule.match('def')).toBeNull();
    });
});
