// test/parts/html.js
import { describe, test, expect } from 'bun:test';
import { Html } from '../../src/parts/html.js';

describe('Html: HTML生成モジュール', () => {

  // ========================================
  // 1. RubyHtml テスト
  // ========================================
  describe('RubyHtml', () => {
    describe('正常系: 有効なHTMLを生成する', () => {
      test('上ルビのみ', () => {
        const expected = '<ruby class="over">漢字<rt>かんじ</rt></ruby>';
        expect(Html.ruby('漢字', 'かんじ', '')).toBe(expected);
      });

      test('下ルビのみ', () => {
        const expected = '<ruby class="under">漢字<rt>かんじ</rt></ruby>';
        expect(Html.ruby('漢字', '', 'かんじ')).toBe(expected);
      });

      test('上下両方のルビ', () => {
        const expected = '<ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby>';
        expect(Html.ruby('漢字', 'かんじ', 'カンジ')).toBe(expected);
      });

      test('親文字やルビ文字にスペースが含まれる場合', () => {
        const expected = '<ruby class="over">親 文字<rt>おや もじ</rt></ruby>';
        expect(Html.ruby('親 文字', 'おや もじ', '')).toBe(expected);
      });
    });

    describe('異常系: エラーをスローする', () => {
      test('引数が文字列でない場合にTypeErrorをスローする', () => {
        const expectedError = { name: 'TypeError', message: '型が違います。String値であるべきです。' };
        expect(() => Html.ruby(null, 'a', 'b')).toThrow(expectedError);
        expect(() => Html.ruby('a', 123, 'b')).toThrow(expectedError);
        expect(() => Html.ruby('a', 'b', {})).toThrow(expectedError);
      });

      test('親文字が空文字の場合にJamlErrorをスローする', () => {
        const expectedError = { name: 'JamlError', message: '親文字が空文字です。親文字は1字以上必要です。' };
        expect(() => Html.ruby('', 'かんじ', '')).toThrow(expectedError);
      });

      test.skip('親文字が空白のみの場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = '親文字が空白文字のみです。親文字は1字以上の非空白な文字が必要です。';
        expect(() => Html.ruby('   ', 'かんじ', '')).toThrow(expectedError);
      });

      test('ルビ文字が上下ともに空文字の場合にJamlErrorをスローする', () => {
        const expectedError = { name: 'JamlError', message: 'ルビ文字が空文字です。ルビ文字は上下少なくとも一方に1字以上の文字が必要です。' };
        expect(() => Html.ruby('漢字', '', '')).toThrow(expectedError);
      });

      test.skip('ルビ文字が上下ともに空白のみの場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = 'ルビ文字が空白文字のみです。ルビ文字は上下少なくとも一方に1字以上の非空白な文字が必要です。';
        expect(() => Html.ruby('漢字', '  ', '　　')).toThrow(expectedError);
      });

    });
  });

  // ========================================
  // 2. EmHtml テスト
  // ========================================
  describe('EmHtml', () => {
    describe('正常系', () => {
      test('有効な強調HTMLを生成する', () => {
        const expected = '<em class="bouten">強調</em>';
        expect(Html.em('強調')).toBe(expected);
      });
    });

    describe('異常系', () => {
      test('引数が文字列でない場合にTypeErrorをスローする', () => {
        const expectedError = { name: 'TypeError', message: '型が違います。String値であるべきです。' };
        expect(() => Html.em(123)).toThrow(expectedError);
      });

      test('強調文字が空文字の場合にJamlErrorをスローする', () => {
        const expectedError = { name: 'JamlError', message: '強調テキストが空文字です。1字以上の文字が必要です。' };
        expect(() => Html.em('')).toThrow(expectedError);
      });

      test.skip('強調文字が空白のみの場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = '強調テキストが空白文字のみです。非空白な1字以上の文字が必要です。';
        expect(() => Html.em(' \t ')).toThrow(expectedError);
      });

    });
  });

  // ========================================
  // 3. AHtml テスト
  // ========================================
  describe('AHtml', () => {
    describe('正常系', () => {
      test('有効なリンクHTMLを生成する', () => {
        const expected = '<a href="https://g.co" target="_blank" rel="noopener noreferrer">Google</a>';
        expect(Html.a('Google', 'https://g.co')).toBe(expected);
      });

//      できません。JamlのRbEmはそれを許しません。これはrubyやemが空文字の時に例外発生させるのと同じ統一性です
//      test('リンクのテキストが空でも生成できる', () => {
//        // <a></a> のようにテキストが空なのはHTMLとして有効
//        const expected = '<a href="https://g.co" target="_blank" rel="noopener noreferrer"></a>';
//        expect(Html.a('', 'https://g.co')).toBe(expected);
//      });
    });

    describe('異常系', () => {
      test('引数が文字列でない場合にTypeErrorをスローする', () => {
        const expectedError = { name: 'TypeError', message: '型が違います。String値であるべきです。' };
        expect(() => Html.a(null, 'url')).toThrow(expectedError);
        expect(() => Html.a('text', 123)).toThrow(expectedError);
      });

      test('テキストが空文字の場合にJamlErrorをスローする', () => {
        const expectedError = { name: 'JamlError', message: 'テキストかhrefが空文字です。両方共1字以上の文字が必要です。' };
        expect(() => Html.a('', 'https://www.google.co.jp/')).toThrow(expectedError);
      });

      test('hrefが空文字の場合にJamlErrorをスローする', () => {
        const expectedError = { name: 'JamlError', message: 'テキストかhrefが空文字です。両方共1字以上の文字が必要です。' };
        expect(() => Html.a('text', '')).toThrow(expectedError);
      });

      test.skip('テキストが空白のみの場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = 'リンク先のURL(href)が空です。';
        expect(() => Html.a('   ', 'https://www.google.co.jp/')).toThrow(expectedError);
      });

      test.skip('hrefが空白のみの場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = 'リンク先のURL(href)が空です。';
        expect(() => Html.a('text', '   ')).toThrow(expectedError);
      });

      test.skip('hrefが無効なスキーム(https://,http://,mailto:,tel:以外)の場合にJamlErrorをスローする（これはHtml責任外。Lexer責任？）', () => {
        const expectedError = 'リンク先のURL(href)が空です。';
        expect(() => Html.a('text', '   ')).toThrow(expectedError);
      });

    });
  });
});
