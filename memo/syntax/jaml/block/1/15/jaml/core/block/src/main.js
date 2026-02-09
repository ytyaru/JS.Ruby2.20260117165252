/**
 * Blockモジュールのメインエントリポイント（ファサード）。
 * 全ての標準ブロック要素（Heading, Paragraph, etc.）を統合してエクスポートします。
 * 内部的な一括利用や、ビルド時のエントリポイントとして機能します。
 */

// 各ブロックの統合エクスポート（NodeとRuleのセット）を再エクスポート
export * from './super/heading.js';
export * from './super/paragraph.js';
export * from './super/thematic-break.js';
export * from './super/part.js';
export * from './super/page-break.js';

// 基底クラスも必要に応じてアクセス可能にする
export { BlockNode } from './core/node.js';
export { BlockRule } from './core/rule.js';

