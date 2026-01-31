import {CharGroup} from "./char-group.js"
export const invisibleChars = new CharGroup([
  [0x0000, 0x001F],
  [0x007F, 0x009F]
], {ja:'統合不可視文字', en:'InvisibleChars'});
