import { describe, test, expect } from "bun:test";
import { TreeText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("TreeText", () => {
    test("Textクラスを継承していること", () => {
        const tree = new TreeText("test");
        expect(tree).toBeInstanceOf(Text);
        expect(tree.content).toBe("test");
    });
});
