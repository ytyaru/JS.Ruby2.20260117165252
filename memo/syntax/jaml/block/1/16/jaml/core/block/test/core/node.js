import { describe, test, expect } from "bun:test";
import { BlockNode } from '../../src/core/node.js';
import { GrammarNode } from '../../../grammar/src/core/node.js';

describe("BlockNode", () => {
    test("GrammarNodeを継承していること", () => {
        const node = new BlockNode('test', [0, 10]);
        expect(node).toBeInstanceOf(BlockNode);
        expect(node).toBeInstanceOf(GrammarNode);
    });
});
