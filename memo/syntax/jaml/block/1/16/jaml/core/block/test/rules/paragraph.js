import { describe, test, expect } from "bun:test";
import { ParagraphRule } from '../../src/rules/paragraph.js';

describe("ParagraphRule", () => {
    test("通常のテキスト行にマッチすること", () => {
        const rule = new ParagraphRule();
        expect(rule.match("Hello")).not.toBeNull();
        expect(rule.match("")).toBeNull();
    });
});

