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
    /*
    test('ルビとリンクの組み合わせを正しく変換すること', () => {
      expect(RbEmFast.parse('漢字《かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>');
      expect(RbEmFast.parse('漢字《｜かんじ｜https://g.co》')).toBe('<a href="https://g.co" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>');
    });
    */

    // 既存の 'ルビとリンクの組み合わせを正しく変換すること' の test ブロックを削除し、
    // 以下の describe ブロックに置き換えてください。

    describe('有効な構文: ルビとリンクの組み合わせ', () => {
      const url = 'https://g.co';

      test('上ルビ + URL', () => {
        const input = `漢字《かんじ｜${url}》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('下ルビ + URL', () => {
        const input = `漢字《｜かんじ｜${url}》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('上下ルビ + URL (URLが末尾)', () => {
        const input = `漢字《かんじ｜カンジ｜${url}》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('URLが先頭 + 上ルビ', () => {
        const input = `漢字《${url}｜かんじ》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>かんじ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('URLが先頭 + 下ルビ', () => {
        const input = `漢字《${url}｜｜かんじ》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>かんじ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('URLが先頭 + 上下ルビ', () => {
        const input = `漢字《${url}｜かんじ｜カンジ》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });

      test('URLが中間 + 上下ルビ', () => {
        const input = `漢字《かんじ｜${url}｜カンジ》`;
        const expected = `<a href="${url}" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>かんじ</rt></ruby><rt aria-hidden="true">カンジ</rt></ruby></a>`;
        expect(RbEmFast.parse(input)).toBe(expected);
      });
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

    describe('無効な構文: 複数のURLが含まれるパターン', () => {
      const urlA = 'https://a.com';
      const urlB = 'https://b.com';
      const urlC = 'https://c.com';

      test('URLが2つ', () => {
        const text = `漢字《${urlA}｜${urlB}》`;
        expect(RbEmFast.parse(text)).toBe(text);
      });

      test('URLが2つ + ルビが1つ', () => {
        const text1 = `漢字《${urlA}｜${urlB}｜かんじ》`;
        expect(RbEmFast.parse(text1)).toBe(text1);

        const text2 = `漢字《${urlA}｜かんじ｜${urlB}》`;
        expect(RbEmFast.parse(text2)).toBe(text2);

        const text3 = `漢字《かんじ｜${urlA}｜${urlB}》`;
        expect(RbEmFast.parse(text3)).toBe(text3);
      });

      test('URLが3つ', () => {
        const text = `漢字《${urlA}｜${urlB}｜${urlC}》`;
        expect(RbEmFast.parse(text)).toBe(text);
      });
    });

    // describe('無効な構文（変換されないこと）のテスト', ...) の中に以下を追加

    describe('無効な構文: メタ文字を含むパターン', () => {

      // --- 1. エスケープなしメタ文字 ---
      describe('エスケープなしのメタ文字', () => {
        test('親文字にメタ文字が含まれると、部分的に変換されるか、変換されない', () => {
          // 期待値: ｜漢｜ は残り、後半の ｜字《うえ》 だけが変換される
          expect(RbEmFast.parse('｜漢｜字《うえ》')).toBe('｜漢｜<ruby class="over">字<rt>うえ</rt></ruby>');
          
          // 期待値: 正規表現にマッチせず、変換されない
          expect(RbEmFast.parse('｜漢《字《うえ》')).toBe('｜漢《字《うえ》');
        });

        test('ルビ文字にメタ文字が含まれると、解釈が変わる', () => {
          // 期待値: 《 と 》 がそれぞれ上ルビ・下ルビとして解釈される
          const expected1 = '<ruby class="under"><ruby class="over">漢字<rt>《</rt></ruby><rt aria-hidden="true">》</rt></ruby>';
          expect(RbEmFast.parse('漢字《《｜》》')).toBe(expected1);

          // 期待値: うえ《｜した》 全体が上ルビとして解釈される
          const expected2 = '<ruby class="over">漢字<rt>うえ《｜した》</rt></ruby>';
          expect(RbEmFast.parse('漢字《うえ《｜した》》')).toBe(expected2);
        });

        test('強調の中にメタ文字が含まれると、そのまま表示される', () => {
          const expected = '<em class="bouten">強｜調</em>';
          expect(RbEmFast.parse('《《強｜調》》')).toBe(expected);
        });
      });

      // --- 2. エスケープありメタ文字 ---
      describe('エスケープありのメタ文字', () => {
        test('親文字内のエスケープされたメタ文字は、単なる文字として扱われる', () => {
          const expected = '<ruby class="over">漢｜字<rt>うえ</rt></ruby>';
          expect(RbEmFast.parse('｜漢\\｜字《うえ》')).toBe(expected);
        });

        test('ルビ文字内のエスケープされたメタ文字は、単なる文字として扱われる', () => {
          const expected = '<ruby class="over">漢字<rt>《うえ｜した》</rt></ruby>';
          expect(RbEmFast.parse('漢字《\\《うえ｜した\\》》')).toBe(expected);
        });
      });

      // --- 3. 複数の要因が重なるパターン ---
      test('URL複数とパイプ数超過が重なるパターンは、変換されない', () => {
        const text = '漢字《https://a｜https://b｜https://c｜https://d》';
        expect(RbEmFast.parse(text)).toBe(text);
      });
    });

    // describe('無効な構文（変換されないこと）のテスト', ...) の中に以下を追加

    describe('無効な構文: メタ文字の扱い', () => {

      describe('エスケープなしメタ文字は変換されない', () => {
        test('親文字が破綻したメタ文字のみ', () => {
          expect(RbEmFast.parse('｜｜《うえ》')).toBe('｜｜《うえ》');
          expect(RbEmFast.parse('｜《《うえ》')).toBe('｜《《うえ》');
          expect(RbEmFast.parse('｜》《うえ》')).toBe('｜》《うえ》');
        });
        test('親文字に破綻したメタ文字と有効文字が混在', () => {
          expect(RbEmFast.parse('｜漢｜字《うえ》')).toBe('｜漢｜字《うえ》');
          expect(RbEmFast.parse('｜漢《字《うえ》')).toBe('｜漢《字《うえ》');
          expect(RbEmFast.parse('｜漢》字《うえ》')).toBe('｜漢》字《うえ》');
          // メタ文字の場所を先頭／末尾に変えたパターン
          expect(RbEmFast.parse('｜｜漢字《うえ》')).toBe('｜｜漢字《うえ》');
          expect(RbEmFast.parse('｜漢字｜《うえ》')).toBe('｜漢字｜《うえ》');
          expect(RbEmFast.parse('｜《漢字《うえ》')).toBe('｜《漢字《うえ》');
          expect(RbEmFast.parse('｜漢字《《うえ》')).toBe('｜漢字《《うえ》');
          expect(RbEmFast.parse('｜》漢字《うえ》')).toBe('｜》漢字《うえ》');
          expect(RbEmFast.parse('｜漢字》《うえ》')).toBe('｜漢字》《うえ》');
        });
        test('親文字に正常なメタ文字と有効文字が混在', () => {
          expect(RbEmFast.parse('｜親文字《おやもじ》《うえ》')).toBe('｜親文字《おやもじ》《《うえ》');
          expect(RbEmFast.parse('｜｜MOJI《おやもじ》《うえ》')).toBe('｜MOJI《おやもじ》《うえ》');
          expect(RbEmFast.parse('｜《《強調》》《うえ》')).toBe('<ruby><em class="bouten">強調<em><rt class="over">うえ</rt></ruby>');
        });

        test('ルビ文字が破綻したメタ文字のみ', () => {
          expect(RbEmFast.parse('漢字《｜》')).toBe('漢字《｜》');
          expect(RbEmFast.parse('漢字《《》')).toBe('漢字《《》');
          expect(RbEmFast.parse('漢字《》》')).toBe('漢字《》》');
        });
        test('ルビ文字に破綻したメタ文字と有効文字が混在', () => {
          expect(RbEmFast.parse('漢字《｜した》')).toBe('<ruby class="under">漢字<rt>した</rt></ruby>');
          expect(RbEmFast.parse('漢字《《した》')).toBe('漢字《《した》');
          expect(RbEmFast.parse('漢字《》した》')).toBe('漢字《》した》');

          expect(RbEmFast.parse('漢字《うえ｜》')).toBe('漢字《うえ｜》');
          expect(RbEmFast.parse('漢字《うえ《》')).toBe('漢字《うえ《》');
          expect(RbEmFast.parse('漢字《うえ》》')).toBe('漢字《うえ》》');

          expect(RbEmFast.parse('漢字《な｜か》')).toBe('<ruby class="under"><ruby class="over">漢字<rt>な</rt></ruby><rt>か</rt></ruby>');
          expect(RbEmFast.parse('漢字《な《か》')).toBe('漢字《な《か》');
          expect(RbEmFast.parse('漢字《な》か》')).toBe('漢字《な》か》');
        });
        test('ルビ文字が複数のメタ文字のみ', () => {
          expect(RbEmFast.parse('漢字《《》》')).toBe('漢字《《》》');
          expect(RbEmFast.parse('漢字《《》》')).toBe('漢字《《》》');
          expect(RbEmFast.parse('漢字《《》》')).toBe('漢字《《》》');
          expect(RbEmFast.parse('漢字《《｜》》')).toBe('漢字《《｜》》');
          expect(RbEmFast.parse('漢字《《｜》')).toBe('漢字《《｜》');
          expect(RbEmFast.parse('漢字《｜》》')).toBe('漢字《｜》》');
        });
        test('ルビ文字がメタ文字と有効文字の混在', () => {
          expect(RbEmFast.parse('漢字《うえ《｜した》》')).toBe('漢字《うえ《｜した》》');
          expect(RbEmFast.parse('漢字《うえ｜》した》')).toBe('漢字《うえ｜》した》');
        });

        test('強調の中にメタ文字', () => {
            // 以下は仕様矛盾です！　エスケープされていない｜《》があるときはHTML変換せず原稿のまま返すべし。実装にテスト結果を合わせてしまえば、仕様矛盾が発見できなくなります。こういう時は、仕様や要件を私に再確認してください。
//          // 強調パターンは `[^》]*?` なので、`｜` や `《` は許容される
//          const expected = '<em class="bouten">強｜《調</em>';
//          expect(RbEmFast.parse('《《強｜《調》》')).toBe(expected);
          expect(RbEmFast.parse('《《強｜《調》》')).toBe('《《強｜《調》》');
        });
      });

      describe('エスケープありメタ文字は文字として変換される', () => {
        test('親文字内のエスケープ', () => {
          const expected = '<ruby class="over">漢｜字<rt>うえ</rt></ruby>';
          expect(RbEmFast.parse('｜漢\\｜字《うえ》')).toBe(expected);
        });

        test('ルビ文字内のエスケープ', () => {
          const expected = '<ruby class="over">漢字<rt>《うえ｜した》</rt></ruby>';
          expect(RbEmFast.parse('漢字《\\《うえ\\｜した\\》》')).toBe(expected);
        });

//      仕様矛盾発覚によりテストコード修正します。
//        test('強調内のエスケープ', () => {
//          const expected = '<em class="bouten">強\\《調</em>';
//          expect(RbEmFast.parse('《《強\\\\《調》》')).toBe(expected);
//        });
        test('強調内のエスケープ', () => {
          const expected = '<em class="bouten">\\｜強\\《調\\》</em>';
          expect(RbEmFast.parse('《\\\\｜《強\\\\《調》\\\\》》')).toBe(expected);
        });

      });

      describe('ネスト構造は変換されない', () => {
        test('ルビの中にルビ構文', () => {
          expect(RbEmFast.parse('漢字《漢《あ》｜漢《い》》')).toBe('漢字《漢《あ》｜漢《い》》');
        });
        test('強調の中に強調構文', () => {
          expect(RbEmFast.parse('《《内側の《《強調》》》》')).toBe('《《内側の《《強調》》》》');
        });
      });
    });




  });
});

