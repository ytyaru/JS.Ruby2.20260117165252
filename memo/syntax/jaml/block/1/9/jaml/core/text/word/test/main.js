import { describe, test, expect } from "bun:test";
import { WordText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("WordText", () => {
    test("Textクラスを継承していること", () => {
        const word = new WordText("test");
        expect(word).toBeInstanceOf(Text);
        expect(word.content).toBe("test");
    });
});
