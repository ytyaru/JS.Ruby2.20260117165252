import { describe, test, expect } from "bun:test";
import { ListText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("ListText", () => {
    test("Textクラスを継承していること", () => {
        const list = new ListText("test");
        expect(list).toBeInstanceOf(Text);
        expect(list.content).toBe("test");
    });
});
