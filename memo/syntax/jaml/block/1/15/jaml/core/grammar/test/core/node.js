import { describe, test, expect } from "bun:test";
import { GrammarNode } from '../../src/core/node.js';

describe("GrammarNode", () => {
    test("インスタンス化できること", () => {
        const node = new GrammarNode('test', [0, 1]);
        expect(node.type).toBe('test');
        expect(node.children).toEqual([]);
    });
});
