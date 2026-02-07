import { describe, test, expect } from "bun:test";
import { PartRule } from '../../src/rules/part.js';

describe("PartRule", () => {
    test("外部参照記法にマッチすること", () => {
        const rule = new PartRule();
        
        // スペースあり
        const match1 = rule.match("part: ./file.jaml");
        expect(match1).not.toBeNull();
        expect(match1[1]).toBe(" ./file.jaml");

        // スペースなし
        const match2 = rule.match("part:./file.jaml");
        expect(match2).not.toBeNull();
        expect(match2[1]).toBe("./file.jaml");

        // 異常系
        expect(rule.match("part")).toBeNull();
    });
});

