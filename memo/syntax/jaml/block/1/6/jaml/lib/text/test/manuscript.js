import { Manuscript } from '../src/manuscript.js';

console.log("--- Manuscript Test ---");

const rawText = "Hello\r\nWorld\0";
const ms = new Manuscript(rawText);

// 正規化テスト
const normalized = ms.text;
const expected = "Hello\nWorld";
console.log(`Normalized: ${JSON.stringify(normalized)}`);
if (normalized === expected) console.log("✅ Normalize Passed");
else console.error("❌ Normalize Failed");

// 行列取得テスト (WorldのW = index 6)
const [row, col] = ms.getRowCol(6);
console.log(`Row/Col for index 6: [${row}, ${col}]`);
if (row === 1 && col === 0) console.log("✅ GetRowCol Passed");
else console.error("❌ GetRowCol Failed");

// インデックス取得テスト
const index = ms.getIndex(1, 0);
console.log(`Index for [1, 0]: ${index}`);
if (index === 6) console.log("✅ GetIndex Passed");
else console.error("❌ GetIndex Failed");
