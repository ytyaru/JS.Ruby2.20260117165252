// RbEm.test.js
import { describe, test, expect } from 'bun:test';
// RbEm.jsからRbEmクラスをインポート
import { RbEm } from './RbEm.js';

describe('RbEm Parser', () => {

  describe('パイプ省略形', () => {
    test('上ルビ', () => {
      expect(RbEm.parse('漢字《かんじ》')).toBe('<ruby class="over">漢字<rt>かんじ</rt></ruby>');
    });
    test('下ルビ', () => {
      expect(RbEm.parse('漢字《｜かんじ》')).toBe('<ruby class="under">漢字<rt>かんじ</rt></ruby>');
    });
    test('上下ルビ', () => {
      expect(RbEm.parse('漢字《かんじ｜カンジ》')).toBe('<ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby>');
    });
    test('義訓ルビ', () => {
      expect(RbEm.parse('超電磁砲《ちょうでんじほう｜レールガン》')).toBe('<ruby class="under"><ruby class="over">超電磁砲<rt>ちょうでんじほう</rt></ruby><rt aria-hidden="true">レールガン</rt></ruby>');
    });
  });

  describe('a要素', () => {
    test('URLのみ', () => {
      expect(RbEm.parse('漢字《https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer">漢字</a>');
    });
    test('URLのみ（パイプ付き）', () => {
      expect(RbEm.parse('漢字《｜https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer">漢字</a>');
      expect(RbEm.parse('漢字《https://www.google.co.jp/｜》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer">漢字</a>');
    });
    test('URLのみ（二重パイプ付き）', () => {
      expect(RbEm.parse('漢字《｜｜https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer">漢字</a>');
      expect(RbEm.parse('漢字《https://www.google.co.jp/｜｜》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer">漢字</a>');
    });
  });

  describe('a要素とruby要素の組み合わせ', () => {
    test('上下ルビ + URL', () => {
      expect(RbEm.parse('漢字《かんじ｜カンジ｜https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby></a>');
    });
    test('上ルビ + URL', () => {
      expect(RbEm.parse('漢字《かんじ｜https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>');
    });
    test('下ルビ + URL', () => {
      expect(RbEm.parse('漢字《｜かんじ｜https://www.google.co.jp/》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>');
    });
    test('URLが先に来るパターン', () => {
      expect(RbEm.parse('漢字《https://www.google.co.jp/｜かんじ》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>');
      expect(RbEm.parse('漢字《https://www.google.co.jp/｜｜かんじ》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>');
    });
    test('URLが中間に来るパターン', () => {
      expect(RbEm.parse('漢字《かんじ｜https://www.google.co.jp/｜カンジ》')).toBe('<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby></a>');
    });
  });

  describe('パイプ付与形', () => {
    test('非漢字のみ', () => {
      expect(RbEm.parse('｜ABC《えーびーしー》')).toBe('<ruby class="over">ABC<rt>えーびーしー</rt></ruby>');
    });
    test('漢字と非漢字の混在', () => {
      expect(RbEm.parse('｜間に非漢字があってもOK《あいだにひかんじがあってもおーけー》')).toBe('<ruby class="over">間に非漢字があってもOK<rt>あいだにひかんじがあってもおーけー</rt></ruby>');
    });
  });

  describe('em要素', () => {
    test('強調のみ', () => {
      expect(RbEm.parse('《《強調》》')).toBe('<em class="bouten">強調</em>');
    });
  });

  describe('ruby要素とem要素の組み合わせ', () => {
    test('強調が親文字', () => {
      expect(RbEm.parse('《《強調》》《うえ｜した》')).toBe('<ruby class="under"><ruby class="over"><em class="bouten">強調</em><rt>うえ</rt></ruby><rt aria-hidden="true">した</rt></ruby>');
    });
    test('パイプ付与形で強調が親文字', () => {
      expect(RbEm.parse('｜《《強調》》《うえ｜した》')).toBe('<ruby class="under"><ruby class="over"><em class="bouten">強調</em><rt>うえ</rt></ruby><rt aria-hidden="true">した</rt></ruby>');
    });
    test('親文字の一部が強調', () => {
      const input = '｜親文字まえ《《強調》》親文字うしろ《ルビうえ｜ルビした｜https://www.google.co.jp/》';
      const expected = '<a href="https://www.google.co.jp/" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">親文字まえ<em class="bouten">強調</em>親文字うしろ<rt>ルビうえ</rt></ruby><rt aria-hidden="true">ルビした</rt></ruby></a>';
      expect(RbEm.parse(input)).toBe(expected);
    });
  });

  describe('HTMLに変換されないパターン', () => {
    test('ルビが空', () => {
      expect(RbEm.parse('漢字《》')).toBe('漢字《》');
      expect(RbEm.parse('漢字《   》')).toBe('漢字《   》');
      expect(RbEm.parse('｜かんじじゃない《》')).toBe('｜かんじじゃない《》');
    });
    test('強調が空', () => {
      expect(RbEm.parse('《《》》')).toBe('《《》》');
      expect(RbEm.parse('《《  》》')).toBe('《《  》》');
    });
    test('パイプ省略形で親文字が非漢字', () => {
      expect(RbEm.parse('MOJI《もじ》')).toBe('MOJI《もじ》');
    });
  });

  describe('エスケープ処理', () => {
    test('ルビ記号のエスケープ', () => {
      expect(RbEm.parse('漢字\\《かんじ》')).toBe('漢字《かんじ》');
    });
    test('パイプ付与形のエスケープ', () => {
      expect(RbEm.parse('\\｜かんじじゃない《カンジ》')).toBe('｜かんじじゃない《カンジ》');
    });
    test('強調記号のエスケープ', () => {
      expect(RbEm.parse('\\《《強調》》')).toBe('《《強調》》');
    });
    test('バックスラッシュ自体のエスケープ', () => {
      expect(RbEm.parse('バックスラッシュ自体: \\\\《《強調》》')).toBe('バックスラッシュ自体: \\<em class="bouten">強調</em>');
    });
  });

  describe('テキストとの混在パターン', () => {
    test('文中', () => {
      expect(RbEm.parse('これは漢字《かんじ》です。')).toBe('これは<ruby class="over">漢字<rt>かんじ</rt></ruby>です。');
    });
    test('文頭', () => {
      expect(RbEm.parse('漢字《かんじ》です。')).toBe('<ruby class="over">漢字<rt>かんじ</rt></ruby>です。');
    });
    test('文末', () => {
      expect(RbEm.parse('これは漢字《かんじ》')).toBe('これは<ruby class="over">漢字<rt>かんじ</rt></ruby>');
    });
    test('パイプ付与形と混在', () => {
      expect(RbEm.parse('パイプ｜付与《ふよ》です。')).toBe('パイプ<ruby class="over">付与<rt>ふよ</rt></ruby>です。');
    });
    test('パイプ省略形と混在', () => {
      expect(RbEm.parse('パイプ省略《しょうりゃく》です。')).toBe('パイプ<ruby class="over">省略<rt>しょうりゃく</rt></ruby>です。');
    });
    test('複数パターンの混在', () => {
      expect(RbEm.parse('これは漢字《かんじ》であり｜MOJI《もじ》です。')).toBe('これは<ruby class="over">漢字<rt>かんじ</rt></ruby>であり<ruby class="over">MOJI<rt>もじ</rt></ruby>です。');
    });
  });

  describe('日本語圏で漢字として扱われる文字', () => {
    test('々', () => {
      expect(RbEm.parse('佐々木《ささき》')).toBe('<ruby class="over">佐々木<rt>ささき</rt></ruby>');
    });
    test('ヶ', () => {
      expect(RbEm.parse('一ヶ月《いっかげつ》')).toBe('<ruby class="over">一ヶ月<rt>いっかげつ</rt></ruby>');
    });
    test('ヵ', () => {
      expect(RbEm.parse('三ヵ条《さんかじょう》')).toBe('<ruby class="over">三ヵ条<rt>さんかじょう</rt></ruby>');
    });
    test('〇', () => {
      expect(RbEm.parse('一〇〇《ひゃく》')).toBe('<ruby class="over">一〇〇<rt>ひゃく</rt></ruby>');
      expect(RbEm.parse('〇〇《ダブルゼロ》')).toBe('<ruby class="over">〇〇<rt>ダブルゼロ</rt></ruby>');
    });
  });

  // --- ここからが追加・修正されたテスト ---
  describe('空白文字と改行の厳密なテスト', () => {
    const WHITESPACE_CHARS = [' ', '　', '\t', '\r']; // \nはエラーになるので除外

    describe('HTMLに変換されないパターン（空白）', () => {
      test('ルビが空または空白のみ', () => {
        expect(RbEm.parse('漢字《》')).toBe('漢字《》');
        for (const char of WHITESPACE_CHARS) {
          const text = `漢字《${char}${char}》`;
          expect(RbEm.parse(text)).toBe(text);
        }
      });

      test('強調が空または空白のみ', () => {
        expect(RbEm.parse('《《》》')).toBe('《《》》');
        for (const char of WHITESPACE_CHARS) {
          const text = `《《${char}${char}》》`;
          expect(RbEm.parse(text)).toBe(text);
        }
      });

      test('パイプ付与形で親文字が空白のみ', () => {
        for (const char of WHITESPACE_CHARS) {
          const text = `｜${char}${char}《ルビ》`;
          expect(RbEm.parse(text)).toBe(text);
        }
      });
    });

    describe('構文エラー：インライン要素内の改行', () => {
      const errorMessage = 'インライン要素の構文内に改行文字を含めることはできません。';

      test('ルビカッコ内に改行', () => {
        expect(() => RbEm.parse('漢字《か\nんじ》')).toThrow(errorMessage);
      });
      test('強調カッコ内に改行', () => {
        expect(() => RbEm.parse('《《強\n調》》')).toThrow(errorMessage);
      });
      test('パイプ付与形の親文字に改行', () => {
        expect(() => RbEm.parse('｜親文\n字《ルビ》')).toThrow(errorMessage);
      });
      test('複雑な構文内に改行', () => {
        expect(() => RbEm.parse('｜まえ《《強\n調》》うしろ《ルビ》')).toThrow(errorMessage);
      });
    });
  });

});
