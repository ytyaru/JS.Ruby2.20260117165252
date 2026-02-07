import { describe, test, expect } from "bun:test";
import { FenceNode } from '../src/core/node.js';
import { FenceRule } from '../src/core/rule.js';
import { GrammarNode } from '../../grammar/src/core/node.js'; // 基底クラス確認用

describe("Fence Core", () => {
    test("FenceNodeが生成でき、GrammarNodeを継承していること", () => {
        const node = new FenceNode('test', [0, 10]);
        expect(node).toBeInstanceOf(GrammarNode); // 継承確認
        expect(node.type).toBe('test');
        expect(node.location).toEqual([0, 10]);
        expect(node.children).toEqual([]); // childrenを持つことを確認
    });

    test("FenceRuleがマッチすること", () => {
        const rule = new FenceRule('fence', /^```/);
        expect(rule.match('```js')).not.toBeNull();
    });
});
