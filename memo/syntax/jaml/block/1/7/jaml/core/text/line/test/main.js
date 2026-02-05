import { describe, test, expect } from "bun:test";
import { LineText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("LineText", () => {
    test("Textクラスを継承していること", () => {
        const line = new LineText("test");
        expect(line).toBeInstanceOf(Text);
        expect(line.content).toBe("test");
    });
});
