import { describe, test, expect } from "bun:test";
import { UnitText } from '../src/main.js';
import { Text } from '../../core/src/main.js';

describe("UnitText", () => {
    test("Textクラスを継承していること", () => {
        const unit = new UnitText("test");
        expect(unit).toBeInstanceOf(Text);
        expect(unit.content).toBe("test");
    });
});
