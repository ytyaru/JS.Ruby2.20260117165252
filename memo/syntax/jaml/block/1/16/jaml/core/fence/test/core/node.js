import { describe, test, expect } from "bun:test";
import { FenceNode } from '../../src/core/node.js';
import { GrammarNode } from '../../../grammar/src/core/node.js';

describe("FenceNode", () => {
    test("GrammarNodeを継承していること", () => {
        const node = new FenceNode('test', [0, 10]);
        expect(node).toBeInstanceOf(FenceNode);
        expect(node).toBeInstanceOf(GrammarNode);
    });
});
