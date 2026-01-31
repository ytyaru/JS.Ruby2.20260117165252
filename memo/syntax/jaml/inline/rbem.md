# RbEm

日本語で使う`<ruby>`,`<em>`要素を短縮表記する記法について、その仕様を定義する。場合によって`<a>`で囲まれる。

## メタ文字

字|名称|役割
--|----|----
`\`|バックスラッシュ|以下メタ文字をそのまま出力する（メタ文字のメタ文字）
`｜`|パイプ|ルビ要素の親文字を明示する。ルビ文字内にある場合は上・下・URLの区別をする。
`《`|二重山括弧開始|ルビ要素のルビ文字を指定する開始位置を示す
`》`|二重山括弧終了|ルビ要素のルビ文字を指定する終了位置を示す
`,`|カンマ|ルビ要素をグループ・熟語・モノに分類する

## `<ruby>`

### パイプ付与形

#### グループ・ルビ

Jaml記法|HTML
--------|----
`｜漢字《うえ》`|`<ruby class="over">漢字<rt>うえ</rt></ruby>`
`｜漢字《｜した》`|`<ruby class="under">漢字<rt>した</rt></ruby>`
`｜漢字《うえ｜した》`|`<ruby class="under"><ruby class="over">漢字<rt>うえ</rt></ruby><rt aria-hidden="true">した</rt></ruby>`
`｜MOJI《もじ》`|`<ruby class="over">MOJI<rt>もじ</rt></ruby>`

グループルビは、親文字、ルビ文字、共にカンマ`,`が無いのが特徴。後述する熟語、モノのルビにはカンマが含まれる。

上下両方ルビがある時、下のほうは`aria-hidden="true"`が付く。つまり上ルビが優先して読み上げられる。

#### 熟語・ルビ

Jaml記法|HTML
--------|----
`｜新垣,結衣《あらがき,ゆい》`|`<ruby class="over">新垣<rt>あらがき</rt>結衣<rt>ゆい</rt></ruby>`
`｜新垣,結衣《｜あらがき,ゆい》`|`<ruby class="under">新垣<rt>あらがき</rt>結衣<rt>ゆい</rt></ruby>`
`｜新垣,結衣《あらがき,ゆい｜ガッキー》`|`<ruby class="under"><ruby class="over">新垣<rt>あらがき</rt>結衣<rt>ゆい</rt></ruby><rt aria-hidden="true">ガッキー</rt></ruby>`
`｜新垣,結衣《ガッキー｜あらがき,ゆい》`|`<ruby class="over"><ruby class="under">新垣<rt aria-hidden="true">あらがき</rt>結衣<rt aria-hidden="true">ゆい</rt></ruby><rt>ガッキー</rt></ruby>`
`｜MO,JI《も,じ》`|`<ruby class="over">MO<rt>も</rt>JI<rt>じ</rt></ruby>`

熟語ルビは親文字にカンマ`,`が必ずあるのが特徴。そして上下ルビの少なくとも一方にもカンマがある。URLは対象外。カンマがある場合、その要素数は必ず同数であること。もし異なれば構文エラー。

#### モノ・ルビ

Jaml記法|HTML
--------|----
`｜新垣結衣《あら,がき,ゆ,い》`|`<ruby class="over">新<rt>あら</rt>垣<rt>がき</rt>結<rt>ゆ</rt>衣<rt>い</rt></ruby>`
`｜新垣結衣《あら,がき,ゆ,い｜ガッキー》`|`<ruby class="under"><ruby class="over">新<rt>あら</rt>垣<rt>がき</rt>結<rt>ゆ</rt>衣<rt>い</rt></ruby><rt aria-hidden="true">ガッキー</rt></ruby>`
`｜新垣結衣《ガッキー｜あら,がき,ゆ,い》`|`<ruby class="over"><ruby class="under">新<rt aria-hidden="true">あら</rt>垣<rt aria-hidden="true">がき</rt>結<rt aria-hidden="true">ゆ</rt>衣<rt aria-hidden="true">い</rt></ruby><rt>ガッキー</rt></ruby>`
`｜新垣結衣《あら,がき,ゆ,い｜ガ,ッ,キ,ー》`|`<ruby class="under"><ruby class="over">新<rt>あら</rt></ruby><rt aria-hidden="true">ガ</rt><ruby class="over">垣<rt>がき</rt></ruby><rt aria-hidden="true">ッ</rt><ruby class="over">結<rt>ゆ</rt></ruby><rt aria-hidden="true">キ</rt><ruby class="over">衣<rt>い</rt></ruby><rt aria-hidden="true">ー</rt></ruby>`
`｜新垣結衣《ガ,ッ,キ,ー｜あら,がき,ゆ,い》`|`<ruby class="over"><ruby class="under">新<rt aria-hidden="true">あら</rt></ruby><rt>ガ</rt><ruby class="under">垣<rt aria-hidden="true">がき</rt></ruby><rt>ッ</rt><ruby class="under">結<rt aria-hidden="true">ゆ</rt></ruby><rt>キ</rt><ruby class="under">衣<rt aria-hidden="true">い</rt></ruby><rt>ー</rt></ruby>`

モノルビは親文字にカンマが無いのに、ルビ文字にカンマがあるのが特徴。

## `<a>`, `<a><ruby>`

Jaml記法|HTML
--------|----
`｜漢字《URL》`|`<a href="URL" target="_blank" rel="noopener noreferrer">漢字</a>`
`｜漢字《うえルビ｜URL》`|`<a href="URL" target="_blank" rel="noopener noreferrer"><ruby class="over">漢字<rt>うえ</rt></ruby></a>`
`｜漢字《｜したルビ｜URL》`|`<a href="URL" target="_blank" rel="noopener noreferrer"><ruby class="under">漢字<rt>した</rt></ruby><rt>した</rt></a>`
`｜漢字《うえルビ｜したルビ｜URL》`|`<a href="URL" target="_blank" rel="noopener noreferrer"><ruby class="under"><ruby class="over">漢字<rt>うえ</rt></ruby><rt aria-hidden="true">した</rt></ruby></a>`

# パイプ省略形

## `<ruby>`

親文字が漢字やそれと一緒に使用される踊り字などのみで構成された場合。すなわち親文字は`/[\p{Sc=Han}々〆ヶヵ仝〻〼ヿ]+/u`で判定する。

Jaml記法|HTML
--------|----
`漢字《うえ》`|`<ruby class="over">漢字<rt>うえ</rt></ruby>`
`漢字《｜した》`|`<ruby class="under">漢字<rt>した</rt></ruby>`
`漢字《うえ｜した》`|`<ruby class="under"><ruby class="over">漢字<rt>うえ</rt></ruby><rt aria-hidden="true">した</rt></ruby>`

### 日本漢字抽出不可能問題

本当は日本で使用する漢字のみにしたかったが、UnicodeのCJK統合漢字という仕様により不可能。

`一-龠`だと人名や地名で使う漢字をカバーできない。さりとて`\p{Sc=Han}`だと中国漢字全部に加えハングル文字まで含めてしまう。Unicodeや正規表現の仕様と性能限界により、現実的な処理負荷で、日本語で使う文字だけを抽出することは不可能である。

### 



https://webst8.com › CODE › HTML
2024/08/18 — ※HTML・CSSなどの静的サイトでも、aタグでtarget="_blank"を使って新

target= "_blank"で使われるrel="noopener noreferrer"の意味
WEBST8
https://webst8.com › CODE › HTML
2024/08/18 — ※HTML・CSSなどの静的サイトでも、aタグでtarget="_blank"を使って新しいタブで開く設定する際に、rel属性に"noopener"や"noreferrer"を指定することが ...
