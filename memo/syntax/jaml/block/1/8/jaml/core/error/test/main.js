import { describe, test, expect } from "bun:test";
import { JamlError } from '../src/main.js';

describe("JamlError", () => {
    test("メッセージと名前が正しく設定されること", () => {
        const msg = "Test Error Message";
        const err = new JamlError(msg);

        expect(err.message).toBe(msg);
        expect(err.name).toBe('JamlError');
        expect(err.cause).toBeUndefined();
    });

    test("Cause(原因)が正しく保持されること", () => {
        const msg = "Wrapper Error";
        const originalError = new Error("Original Cause");
        const err = new JamlError(msg, originalError);

        expect(err.message).toBe(msg);
        expect(err.cause).toBe(originalError);
    });

    test("スタックトレースが存在すること", () => {
        const err = new JamlError("Stack Test");
        expect(err.stack).toBeDefined();
    });
});

