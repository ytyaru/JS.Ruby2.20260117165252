import { describe, test, expect } from "bun:test";
import { BlockNode } from '../src/core/node.js';
import { BlockRule } from '../src/core/rule.js';
import { GrammarNode } from '../../grammar/src/core/node.js'; // 基底クラス確認用

describe("Block Core", () => {
    test("BlockNodeが生成でき、GrammarNodeを継承していること", () => {
        const node = new BlockNode('test', [0, 10]);
        expect(node).toBeInstanceOf(GrammarNode); // 継承確認
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

