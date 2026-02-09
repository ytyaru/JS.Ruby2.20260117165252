import { describe, test, expect } from "bun:test";
import { BlockRule } from '../../src/core/rule.js';
import { GrammarRule } from '../../../grammar/src/core/rule.js';

describe("BlockRule", () => {
    test("GrammarRuleを継承していること", () => {
        const rule = new BlockRule('test', /test/);
        expect(rule).toBeInstanceOf(BlockRule);
        expect(rule).toBeInstanceOf(GrammarRule);
    });

    test("正規表現マッチングが動作すること", () => {
        const rule = new BlockRule('heading', /^# /);
        
        // マッチする場合
        const match = rule.match('# Title');
        expect(match).not.toBeNull();
        expect(match[0]).toBe('# ');

        // マッチしない場合
        expect(rule.match('Title')).toBeNull();
    });
});

