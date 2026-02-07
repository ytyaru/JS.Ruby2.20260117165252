import { describe, test, expect } from "bun:test";
import { InlineNode } from '../src/core/node.js';
import { InlineRule } from '../src/core/rule.js';
import { GrammarNode } from '../../grammar/src/core/node.js'; // 基底クラス確認用

describe("Inline Core", () => {
    test("InlineNodeが生成でき、GrammarNodeを継承していること", () => {
        const node = new InlineNode('test', [0, 10]);
        expect(node).toBeInstanceOf(GrammarNode); // 継承確認
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

