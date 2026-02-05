import { describe, test, expect } from "bun:test";
import { FenceNode } from '../src/core/node.js';
import { FenceRule } from '../src/core/rule.js';

describe("Fence Core", () => {
    test("FenceNodeが生成できること", () => {
        const node = new FenceNode('test', [0, 10]);
        expect(node.type).toBe('test');
        expect(node.location).toEqual([0, 10]);
        expect(node.children).toEqual([]);
    });

    test("FenceRuleがマッチすること", () => {
        const rule = new FenceRule('heading', /^# /);
        expect(rule.match('# Hello')).not.toBeNull();
        expect(rule.match('Hello')).toBeNull();
    });
});

