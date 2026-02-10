import { describe, test, expect } from "bun:test";
import { PartRule } from '../../src/rules/part.js';

describe("PartRule", () => {
    test("外部参照記法にマッチすること", () => {
        const rule = new PartRule();
        expect(rule.match("part: ./file.jaml")).not.toBeNull();
        expect(rule.match("part:./file.jaml")).not.toBeNull();
    });
});

