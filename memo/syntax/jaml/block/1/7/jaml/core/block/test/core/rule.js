import { describe, test, expect } from "bun:test";
import { BlockRule } from '../../src/core/rule.js';

describe("Block Core", () => {
    test("BlockRuleがマッチすること", () => {
        const rule = new BlockRule('heading', /^# /);
        
        expect(rule.match('# Hello')).not.toBeNull();
        expect(rule.match('Hello')).toBeNull();
    });
});

