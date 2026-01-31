#!/usr/bin/env python3

MAIN_HELP_DESCRIPTION = "Unicode不可視文字ライブラリ構築ツール\n各工程(分類・マージ・JS生成)を一括で実行します。"

MAIN_HELP_EPILOG = """
全工程の流れ:
  1. categorize-source.py : unicode.tsv と heuristic.tsv を由来別に3分類
  2. marge-source.py      : 指定条件で中間ファイルをフィルタリングし merge.tsv 作成
  3. generate-js.py       : merge.tsv から最終的な JS ファイルを生成

主な入出力ファイル一式:
  unicode.tsv           [入力] 基本リスト (Code\\tCategory)
  heuristic.tsv         [入力] 補完リスト (0xXXXX)
  only-unicode.tsv      [中間] unicode.tsvのみに存在
  only-heuristic.tsv    [中間] heuristic.tsvのみに存在
  both.tsv              [中間] 両方に存在
  merge.tsv             [出力] 最終統合リスト
  invisible-chars.js    [出力] JavaScript CharGroup定義

由来キーワード (--cate-white/blackで使用):
  unicode   : unicode.tsvにのみ存在する文字
  heuristic : heuristic.tsvにのみ存在する文字
  both      : 両方のソースで一致した文字

Unicodeカテゴリ一覧 (大分類指定で配下を網羅):
  C (Other): Cc(制御), Cf(書式), Cs(サロゲート), Co(私用), Cn(未定義)
  Z (Separator): Zs(空白), Zl(行), Zp(段落)
  M (Mark): Mn(非前進結合), Mc(前進結合), Me(囲み)
  S (Symbol): Sm(数学), Sc(通貨), Sk(修飾), So(その他)
  P (Punctuation): Pc(連結), Pd(ダッシュ), Ps(開始), Pe(終了), Pi(開始引用), Pf(終了引用), Po(その他)
  L (Letter): Lu(大文字), Ll(小文字), Lt(タイトル), Lm(修飾), Lo(その他)
  N (Number): Nd(10進数字), Nl(数字記号), No(その他数字)
"""

