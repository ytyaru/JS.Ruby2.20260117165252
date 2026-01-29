// test/unicode/other.js
import { describe, test, expect } from 'bun:test';
//import { OtherChars } from '../../src/unicode/other.js';
import { OtherChars } from '../src/other.js';

describe('Unicode OtherChars', () => {
  describe('Cc (Control)', () => {
    const Cc = OtherChars.Cc;

    test('itemsプロパティが、定義された全てのCc範囲の文字を正確に含むこと', () => {
      const expectedCodePoints = new Set();
      for (let i = 0x00; i <= 0x1F; i++) expectedCodePoints.add(i);
      for (let i = 0x7F; i <= 0x9F; i++) expectedCodePoints.add(i);
      
      const receivedCodePoints = new Set(Cc.items.map(c => c.codePointAt(0)));
      
      expect(receivedCodePoints).toEqual(expectedCodePoints);
    });

    test('hasメソッドが各Cc範囲の文字を検出できること', () => {
      expect(Cc.has('\u0000')).toBe(true); // NUL
      expect(Cc.has('\u001F')).toBe(true); // US
      expect(Cc.has('\u007F')).toBe(true); // DEL
      expect(Cc.has('\u009F')).toBe(true);
    });
    
    test('itemsプロパティがASCII制御文字を含むこと', () => {
      expect(Cc.has('\u0000')).toBe(true); // NUL
      expect(Cc.has('\u001F')).toBe(true); // US
      expect(Cc.has('\u007F')).toBe(true); // DEL
    });

    test('isメソッドがCc文字のみで構成された文字列にtrueを返すこと', () => {
      expect(Cc.is('\u0001\u0002')).toBe(true);
    });

    test('isメソッドが他の文字を含む場合にfalseを返すこと', () => {
      expect(Cc.is('\u0001a\u0002')).toBe(false);
    });
  });

  describe('Cf (Format)', () => {
    const Cf = OtherChars.Cf;
    const formatChars = [
      '\u00AD', '\u061C', '\u180E', '\u200B', '\u200C', '\u200D', '\u200E', 
      '\u200F', '\u2060', '\u2061', '\u2062', '\u2063', '\u2064', '\u206A', 
      '\u206B', '\u206C', '\u206D', '\u206E', '\u206F'
    ];

    test('itemsプロパティがすべてのCf文字を含むこと', () => {
      expect(Cf.items).toHaveLength(formatChars.length);
      for (const char of formatChars) {
        expect(Cf.items).toContain(char);
      }
    });

    test('hasメソッドがゼロ幅文字を検出できること', () => {
      expect(Cf.has('zero\u200Bwidth')).toBe(true);
    });

    test('hasメソッドが各Cf文字を検出できること', () => {
      for (const char of formatChars) {
        expect(Cf.has(`text${char}with`)).toBe(true);
      }
    });
  });
});
