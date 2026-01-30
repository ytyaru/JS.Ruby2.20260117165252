#!/usr/bin/env python3

HELP_SUB_EPILOG = """
由来キーワード (--cate-white/blackで使用):
  unicode   : unicode.tsvにのみ存在する文字
  heuristic : heuristic.tsvにのみ存在する文字
  both      : 両方のファイルに存在する文字

Unicodeカテゴリ (大分類指定で配下の小分類を網羅):
  C (Other): Cc(制御), Cf(書式), Cs(サロゲート), Co(私用), Cn(未定義)
  Z (Separator): Zs(空白), Zl(行), Zp(段落)
  M (Mark): Mn(非前進結合), Mc(前進結合), Me(囲み)
  S (Symbol): Sm(数学), Sc(通貨), Sk(修飾), So(その他)
  P (Punctuation): Pc(連結), Pd(ダッシュ), Ps(開始), Pe(終了), Pi(開始引用), Pf(終了引用), Po(その他)
  L (Letter): Lu(大文字), Ll(小文字), Lt(タイトル), Lm(修飾), Lo(その他)
  N (Number): Nd(10進数字), Nl(数字記号), No(その他数字)
"""

