// rbem-fast.test.js
import { describe, test, expect } from 'bun:test';
import { RbEmFast } from './rbem-fast.js';

describe('RbEmFast パーサー', () => {

  describe('有効な構文の変換テスト', () => {
    test('基本的なルビ（上ルビ）を正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《かんじ》')).toBe('<ruby class="over">漢字<rt>かんじ</rt></ruby>');
    });
    test('下ルビのみの構文を正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《｜かんじ》')).toBe('<ruby class="under">漢字<rt>かんじ</rt></ruby>');
    });
    test('上下ルビを正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《かんじ｜カンジ》')).toBe('<ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby>');
    });
    test('リンク（a要素）を正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer">漢字</a>');
    });
    test('ルビとリンクの組み合わせを正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>');
      expect(RbEmFast.parse('漢字《｜かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>');
    });
    test('強調（em要素）を正しく変換すること', () => {
      expect(RbEmFast.parse('《《強調》》')).toBe('<em class="bouten">強調</em>');
    });
    test('複雑な組み合わせを正しく変換すること', () => {
      const input = '｜親文字《《強調》》うしろ《ルビうえ｜した｜https://g.co》';
      const expected = '<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">親文字<em class="bouten">強調</em>うしろ<rt>ルビうえ</rt></ruby><rt aria-hidden="true">した</rt></ruby></a>';
      expect(RbEmFast.parse(input)).toBe(expected);
    });
    test('日本語特有の文字を含む親文字を正しく変換すること', () => {
      expect(RbEmFast.parse('佐々木《ささき》')).toBe('<ruby class="over">佐々木<rt>ささき</rt></ruby>');
      expect(RbEmFast.parse('一ヶ月《いっかげつ》')).toBe('<ruby class="over">一ヶ月<rt>いっかげつ</rt></ruby>');
    });
  });

  describe('無効な構文（変換されないこと）のテスト', () => {
    const shouldRemainUnchanged = (text) => {
      const testName = `変換されないこと: "${text.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u0000/g, '\\0')}"`;
      test(testName, () => {
        expect(RbEmFast.parse(text)).toBe(text);
      });
    };

    // --- 空白文字のみのパターン ---
    shouldRemainUnchanged('｜ 《ルビ》');
    shouldRemainUnchanged('漢字《\t》');
    shouldRemainUnchanged('《《　》》');

    // --- 不正な空文字のパターン ---
    shouldRemainUnchanged('｜《ルビ》');
    shouldRemainUnchanged('漢字《》');
    shouldRemainUnchanged('漢字《うえ｜》');
    shouldRemainUnchanged('漢字《｜｜https://g.co》');

    // --- パイプの数が多すぎるパターン ---
    shouldRemainUnchanged('漢字《うえ｜した｜URL｜余分》');

    // --- パイプなしで親文字が非漢字のパターン ---
    shouldRemainUnchanged('ABC《abc》');

    // --- 制御文字や不正な文字を含むパターン ---
    shouldRemainUnchanged('漢字《かん\u0000じ》');
    shouldRemainUnchanged('漢字《かん\u0007じ》');
    shouldRemainUnchanged('｜\u001B[31mRed\u001B[0m《あか》');
    shouldRemainUnchanged('漢字《\u200Bぜろはば》');

    // --- 改行文字を含むパターン ---
    shouldRemainUnchanged('漢字《か\nんじ》');
    shouldRemainUnchanged('《《強\n調》》');
    shouldRemainUnchanged('｜親文\n字《ルビ》');
  });
});

