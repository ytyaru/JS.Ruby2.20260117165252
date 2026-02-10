import { describe, test, expect } from "bun:test";
import { InlineNode } from '../../src/core/node.js';
import { GrammarNode } from '../../../grammar/src/core/node.js';

describe("InlineNode", () => {
    test("GrammarNodeを継承していること", () => {
        const node = new InlineNode('test', [0, 10]);
        expect(node).toBeInstanceOf(InlineNode);
        expect(node).toBeInstanceOf(GrammarNode);
    });
});
