import { describe, test, expect } from "bun:test";
import { BlockNode } from '../src/core/node.js';
import { BlockRule } from '../src/core/rule.js';

describe("Block Core", () => {
    test("BlockNodeが生成できること", () => {
        const node = new BlockNode('test', [0, 10]);
        expect(node.type).toBe('test');
        expect(node.location).toEqual([0, 10]);
        expect(node.children).toEqual([]);
    });

    test("BlockRuleがマッチすること", () => {
        const rule = new BlockRule('heading', /^# /);
        expect(rule.match('# Hello')).not.toBeNull();
        expect(rule.match('Hello')).toBeNull();
    });
});

