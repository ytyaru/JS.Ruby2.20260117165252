// test/unicode/separator.js
import { describe, test, expect } from 'bun:test';
//import { SeparatorChars } from '../../src/unicode/separator.js';
import { SeparatorChars } from '../src/separator.js';

describe('Unicode SeparatorChars', () => {
  describe('Zs (Space Separator)', () => {
    const Zs = SeparatorChars.Zs;
    const spaceChars = [
      '\u0020', '\u00A0', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', 
      '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', 
      '\u202F', '\u205F', '\u3000'
    ];
    test('itemsプロパティが、定義された全てのZs文字を正確に含むこと', () => {
      // sort() を使って順序を揃えることで、配列の内容が完全に一致することを検証
      expect(Zs.items.sort()).toEqual(spaceChars.sort());
    });

    test('isメソッドがZs文字のみで構成された文字列にtrueを返すこと', () => {
      expect(Zs.is(spaceChars.join(''))).toBe(true);
    });

    test('isメソッドが他の文字を含む場合にfalseを返すこと', () => {
      expect(Zs.is(' a ')).toBe(false);
    });

    test('hasメソッドが各Zs文字を検出できること', () => {
      for (const char of spaceChars) {
        expect(Zs.has(`text${char}with`)).toBe(true);
      }
    });
  });

  describe('Zl (Line Separator)', () => {
    const Zl = SeparatorChars.Zl;
    test('ZlがU+2028のみを含むこと', () => {
      expect(Zl.items).toEqual(['\u2028']);
      expect(Zl.is('\u2028')).toBe(true);
      expect(Zl.has('line\u2028separator')).toBe(true);
    });
  });

  describe('Zp (Paragraph Separator)', () => {
    const Zp = SeparatorChars.Zp;
    test('ZpがU+2029のみを含むこと', () => {
      expect(Zp.items).toEqual(['\u2029']);
      expect(Zp.is('\u2029')).toBe(true);
      expect(Zp.has('paragraph\u2029separator')).toBe(true);
    });
  });

  describe('Z (All Separators)', () => {
    const Z = SeparatorChars.Z;
    test('ZがZs, Zl, Zpのすべてを含むこと', () => {
      expect(Z.has('\u3000')).toBe(true); // Zs
      expect(Z.has('\u2028')).toBe(true); // Zl
      expect(Z.has('\u2029')).toBe(true); // Zp
    });
  });
});
