import { describe, test, expect } from "bun:test";
import { FenceRule } from '../../src/core/rule.js';
import { GrammarRule } from '../../../../grammar/src/core/rule.js';

describe("FenceRule", () => {
    test("GrammarRuleを継承していること", () => {
        const rule = new FenceRule('test', /test/);
        expect(rule).toBeInstanceOf(FenceRule);
        expect(rule).toBeInstanceOf(GrammarRule);
    });

    test("正規表現マッチングが動作すること", () => {
        const rule = new FenceRule('heading', /^# /);
        
        // マッチする場合
        const match = rule.match('# Title');
        expect(match).not.toBeNull();
        expect(match[0]).toBe('# ');

        // マッチしない場合
        expect(rule.match('Title')).toBeNull();
    });
});

