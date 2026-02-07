import { describe, test, expect } from "bun:test";
import { GridText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("GridText", () => {
    test("Textクラスを継承していること", () => {
        const grid = new GridText("test");
        expect(grid).toBeInstanceOf(Text);
        expect(grid.content).toBe("test");
    });
});
