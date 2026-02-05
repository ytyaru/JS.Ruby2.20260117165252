import { describe, test, expect } from "bun:test";
import { InlineNode } from '../src/core/node.js';
import { InlineRule } from '../src/core/rule.js';

describe("Inline Core", () => {
    test("InlineNodeが生成できること", () => {
        const node = new InlineNode('test', [0, 10]);
        expect(node.type).toBe('test');
        expect(node.location).toEqual([0, 10]);
        expect(node.children).toEqual([]);
    });

    test("InlineRuleがマッチすること", () => {
        const rule = new InlineRule('heading', /^# /);
        expect(rule.match('# Hello')).not.toBeNull();
        expect(rule.match('Hello')).toBeNull();
    });
});

