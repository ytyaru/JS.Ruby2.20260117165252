// rbem-fast.test.js
import { describe, test, expect } from 'bun:test';
import { RbEmFast } from './rbem-fast.js';

describe('RbEmFast Parser', () => {

  describe('Valid Syntax Transformation', () => {
    test('should handle standard ruby', () => {
      expect(RbEmFast.parse('漢字《かんじ》')).toBe('<ruby class="over">漢字<rt>かんじ</rt></ruby>');
    });
    test('should handle down-ruby only syntax', () => {
      expect(RbEmFast.parse('漢字《｜かんじ》')).toBe('<ruby class="under">漢字<rt>かんじ</rt></ruby>');
    });
    test('should handle over and down ruby', () => {
      expect(RbEmFast.parse('漢字《かんじ｜カンジ》')).toBe('<ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby>');
    });
    test('should handle links', () => {
      expect(RbEmFast.parse('漢字《https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer">漢字</a>');
    });
    test('should handle ruby and links combined', () => {
      expect(RbEmFast.parse('漢字《かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>');
      expect(RbEmFast.parse('漢字《｜かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>');
    });
    test('should handle emphasis', () => {
      expect(RbEmFast.parse('《《強調》》')).toBe('<em class="bouten">強調</em>');
    });
    test('should handle complex combinations', () => {
      const input = '｜親文字《《強調》》うしろ《ルビうえ｜した｜https://g.co》';
      const expected = '<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">親文字<em class="bouten">強調</em>うしろ<rt>ルビうえ</rt></ruby><rt aria-hidden="true">した</rt></ruby></a>';
      expect(RbEmFast.parse(input)).toBe(expected);
    });
    test('should handle Japanese-specific characters', () => {
      expect(RbEmFast.parse('佐々木《ささき》')).toBe('<ruby class="over">佐々木<rt>ささき</rt></ruby>');
      expect(RbEmFast.parse('一ヶ月《いっかげつ》')).toBe('<ruby class="over">一ヶ月<rt>いっかげつ</rt></ruby>');
    });
  });

  describe('Invalid Syntax (Should Not Transform)', () => {
    const shouldRemainUnchanged = (text) => {
      test(`should not transform: ${text.replace(/\u0000/g, '\\0')}`, () => {
        expect(RbEmFast.parse(text)).toBe(text);
      });
    };

    // --- Whitespace-only patterns ---
    shouldRemainUnchanged('｜ 《ルビ》');
    shouldRemainUnchanged('漢字《\t》');
    shouldRemainUnchanged('《《　》》');
    shouldRemainUnchanged('漢字《うえ｜\r｜した》');

    // --- Illegal empty string patterns ---
    shouldRemainUnchanged('｜《ルビ》');
    shouldRemainUnchanged('漢字《》');
    shouldRemainUnchanged('漢字《うえ｜》');
    shouldRemainUnchanged('漢字《｜｜https://g.co》');
    shouldRemainUnchanged('漢字《うえ｜した｜》');
    shouldRemainUnchanged('《《》》');

    // --- Pipe count exceeded ---
    shouldRemainUnchanged('漢字《うえ｜した｜URL｜余分》');
    shouldRemainUnchanged('漢字《｜｜｜》');

    // --- Non-kanji parent without pipe ---
    shouldRemainUnchanged('ABC《abc》');

    // --- Malicious / Control characters ---
    shouldRemainUnchanged('漢字《かん\u0000じ》'); // NUL Byte
    shouldRemainUnchanged('漢字《かん\u0007じ》'); // BELL
    shouldRemainUnchanged('｜\u001B[31mRed\u001B[0m《あか》'); // ANSI Escape Code
    shouldRemainUnchanged('漢字《\u200Bぜろはば》'); // Zero-width space
  });
});
