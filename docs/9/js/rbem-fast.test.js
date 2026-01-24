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

    describe('パイプ省略形: 親文字が非日本語の文字の場合', () => {
      
      test('変換されないこと(1): 韓国語のハングル文字', () => {
        const text = '안녕하세요《アニョハセヨ》';
        // 期待値: 親文字が[一-龠...]の範囲外なので、変換されずにそのまま返る
        expect(RbEmFast.parse(text)).toBe(text);
      });

      // NOTE: このテストは意図的に失敗します。
      // '你'は[一-龠]の範囲に含まれるため、現状のRbEmFastでは変換されてしまいます。
      // これは、日本語のみで使われる漢字を正規表現で完全に分離することの困難さを示すための、
      // 「失敗するべきテスト」としてここに記録します。
      // 将来、より高度な漢字判定ロジックが実装された際に、このテストが成功するようになります。
      test.skip('変換されないこと(2): 中国語のみで使われる漢字（現状は失敗する）', () => {
        const text = '你好《ニーハオ》';
        // 期待値: 変換されないこと
        // 実際の結果: <ruby class="over">你好<rt>ニーハオ</rt></ruby>
        expect(RbEmFast.parse(text)).toBe(text);
      });

    });

    // NOTE: 以下のテストは、現在の正規表現 '[一-龠...]' の限界を示すために意図的に失敗します。
    // これらの漢字は日本語で使われますが、基本的な漢字ブロックの範囲外にあります。
    // 将来、親文字の漢字判定をより広範な '\p{Script=Han}' などに変更した場合、
    // これらのテストは成功するようになります。
    // ただし、その変更は、より多くの中国語特有の漢字なども許容するトレードオフを伴います。
    describe.skip('パイプ省略形: [一-龠]範囲外の日本語漢字（現状は失敗する）', () => {

      test('変換されるべき: 髙 (はしごだか)', () => {
        const text = '髙島屋《たかしまや》';
        const expected = '<ruby class="over">髙島屋<rt>たかしまや</rt></ruby>';
        // 実際の結果: '髙島屋《たかしまや》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

      test('変換されるべき: 﨑 (たつさき)', () => {
        const text = '山﨑《やまざき》';
        const expected = '<ruby class="over">山﨑<rt>やまざき</rt></ruby>';
        // 実際の結果: '山﨑《やまざき》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

      test('変換されるべき: 𠮷 (つちよし)', () => {
        const text = '𠮷野家《よしのや》';
        const expected = '<ruby class="over">𠮷野家<rt>よしのや</rt></ruby>';
        // 実際の結果: '𠮷野家《よしのや》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

      test('変換されるべき: 𠮷 (つちよし)', () => {
        const text = '𠮷野家《よしのや》';
        const expected = '<ruby class="over">𠮷野家<rt>よしのや</rt></ruby>';
        // 実際の結果: '𠮷野家《よしのや》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

      test('変換されるべき: 塚(つか CJK互換漢字 U+FA10)', () => {
        const text = '塚《つか》';
        const expected = '<ruby class="over">塚<rt>つか</rt></ruby>';
        // 実際の結果: '塚《つか》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

      test('変換されるべき: 塚(つか CJK統合漢字拡張A U+4FF1)', () => {
        const text = '俱《とも》';
        const expected = '<ruby class="over">俱<rt>とも</rt></ruby>';
        // 実際の結果: '俱《とも》' (変換されない)
        expect(RbEmFast.parse(text)).toBe(expected);
      });

    });

    describe('URL判定とa要素の変換テスト', () => {

      describe('有効なURLパターン', () => {
        const url = 'https://www.google.co.jp/';
        
        test('URLのみ', () => {
          expect(RbEmFast.parse(`漢字《${url}》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
        });
        /*
        test('URLと空のパイプ', () => {
          expect(RbEmFast.parse(`漢字《｜${url}》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
          expect(RbEmFast.parse(`漢字《${url}｜》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
        });

        test('URLと複数の空のパイプ', () => {
          expect(RbEmFast.parse(`漢字《｜｜${url}》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
          expect(RbEmFast.parse(`漢字《｜${url}｜》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
          expect(RbEmFast.parse(`漢字《${url}｜｜》`)).toBe(`<a href="${url}" target="_blank" rel="noopener noreferrer">漢字</a>`);
        });
      });
      */
        test('URLと空のパイプ', () => {
          expect(RbEmFast.parse(`漢字《｜${url}》`)).toBe(`漢字《｜${url}》`);
          expect(RbEmFast.parse(`漢字《${url}｜》`)).toBe(`漢字《${url}｜》`);
        });

        test('URLと複数の空のパイプ', () => {
          expect(RbEmFast.parse(`漢字《｜｜${url}》`)).toBe(`漢字《｜｜${url}》`);
          expect(RbEmFast.parse(`漢字《｜${url}｜》`)).toBe(`漢字《｜${url}｜》`);
          expect(RbEmFast.parse(`漢字《${url}｜｜》`)).toBe(`漢字《${url}｜｜》`);
        });

        test('URLと空白文字のみ', () => {
          expect(RbEmFast.parse(`漢字《　｜${url}》`)).toBe(`漢字《　｜${url}》`);
          expect(RbEmFast.parse(`漢字《${url}｜　》`)).toBe(`漢字《${url}｜　》`);
        });

        test('URLと複数の空のパイプ', () => {
          expect(RbEmFast.parse(`漢字《　｜　｜${url}》`)).toBe(`漢字《　｜　｜${url}》`);
          expect(RbEmFast.parse(`漢字《　｜${url}｜　》`)).toBe(`漢字《　｜${url}｜　》`);
          expect(RbEmFast.parse(`漢字《${url}｜　｜　》`)).toBe(`漢字《${url}｜　｜　》`);
        });
      });



      describe('無効なURLパターン（ルビとして扱われる）', () => {
        test('スキーマが一文字足りない', () => {
          const text = '漢字《htps://www.google.co.jp/》';
          // 期待値: 'https://'で始まらないため、通常のルビとして扱われる
          const expected = '<ruby class="over">漢字<rt>htps://www.google.co.jp/</rt></ruby>';
          expect(RbEmFast.parse(text)).toBe(expected);
        });

        test('スラッシュが足りない', () => {
          const text = '漢字《https:/www.google.co.jp/》';
          const expected = '<ruby class="over">漢字<rt>https:/www.google.co.jp/</rt></ruby>';
          expect(RbEmFast.parse(text)).toBe(expected);
        });

        test('コロンが足りない', () => {
          const text = '漢字《https//www.google.co.jp/》';
          const expected = '<ruby class="over">漢字<rt>https//www.google.co.jp/</rt></ruby>';
          expect(RbEmFast.parse(text)).toBe(expected);
        });

      });
    });
  });
});

