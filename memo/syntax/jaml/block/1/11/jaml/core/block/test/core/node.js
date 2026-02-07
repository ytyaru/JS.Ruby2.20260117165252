import { describe, test, expect } from "bun:test";
import { BlockNode } from '../../src/core/node.js';
import { GrammarNode } from '../../../grammar/src/core/node.js';

describe("Block Core", () => {
    test("BlockNodeが生成でき、GrammarNodeを継承していること", () => {
        const node = new BlockNode('test', [0, 10]);
        
        // インスタンス確認
        expect(node).toBeInstanceOf(BlockNode);
        expect(node).toBeInstanceOf(GrammarNode);
        
        // プロパティ確認
        expect(node.type).toBe('test');
        expect(node.location).toEqual([0, 10]);
        expect(node.children).toEqual([]);
    });
});

