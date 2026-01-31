#!/usr/bin/env python3

HELP_SUB_EPILOG = """
由来キーワード (--cate-white/blackで使用):
  unicode   : unicode.tsvにのみ存在する文字
  heuristic : heuristic.tsvにのみ存在する文字
  both      : 両方のファイルに存在する文字
  external  : --add-list で追加した外部ファイルに存在する文字

Unicodeカテゴリ (大分類指定で配下の小分類を網羅):
  【C: その他 (Other)】
  Cc : 制御文字 (Control)
  Cf : 書式設定文字 (Format)
  Cs : サロゲートペア文字 (Surrogate)
  Co : 私用文字 (Private Use)
  Cn : 未定義文字 (Unassigned)

  【Z: セパレータ (Separator)】
  Zs : 空白文字 (Space)
  Zl : 行区切り文字 (Line)
  Zp : 段落区切り文字 (Paragraph)

  【M: 記号 (Mark)】
  Mn : 非前進結合記号 (Nonspacing)
  Mc : 前進結合記号 (Spacing Combining)
  Me : 囲み記号 (Enclosing)

  【S: シンボル (Symbol)】
  Sm : 数学記号 (Math)
  Sc : 通貨記号 (Currency)
  Sk : 修飾記号 (Modifier)
  So : その他記号 (Other)

  【P: 句読点 (Punctuation)】
  Pc : 連結句読点 (Connector)
  Pd : ダッシュ句読点 (Dash)
  Ps : 開始句読点 (Open)
  Pe : 終了句読点 (Close)
  Pi : 開始引用符 (Initial quote)
  Pf : 終了引用符 (Final quote)
  Po : その他句読点 (Other)

  【L: 文字 (Letter)】
  Lu : 大文字 (Uppercase)
  Ll : 小文字 (Lowercase)
  Lt : タイトルケース (Titlecase)
  Lm : 修飾文字 (Modifier)
  Lo : その他文字 (Other)

  【N: 数値 (Number)】
  Nd : 10進数字 (Decimal digit)
  Nl : 数字記号 (Letter)
  No : その他数字 (Other)
"""

# 以下、短縮形
'''
Unicodeカテゴリ (大分類指定で配下の小分類を網羅):
  C (Other): Cc(制御), Cf(書式), Cs(サロゲート), Co(私用), Cn(未定義)
  Z (Separator): Zs(空白), Zl(行), Zp(段落)
  M (Mark): Mn(非前進結合), Mc(前進結合), Me(囲み)
  S (Symbol): Sm(数学), Sc(通貨), Sk(修飾), So(その他)
  P (Punctuation): Pc(連結), Pd(ダッシュ), Ps(開始), Pe(終了), Pi(開始引用), Pf(終了引用), Po(その他)
  L (Letter): Lu(大文字), Ll(小文字), Lt(タイトル), Lm(修飾), Lo(その他)
  N (Number): Nd(10進数字), Nl(数字記号), No(その他数字)
'''

