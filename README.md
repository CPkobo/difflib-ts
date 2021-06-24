# Difflib-ts
PythonのDifflibモジュールをTypeScriptで書き直しつつ、若干の改造を加えたものです。

Differクラスは未実装です。

## 使い方

```
yarn build #./dist に jsファイルが作成される
yarn start #./dist/index.js を実行
```

## SequenceMacther

基本的な使い方はPython版とほぼ同様。

```js
import { SequenceMatcher } from 'sequenceMatcher'

const sm = new SequenceMatcher()
sm.setSeqs("これは原文１です", "これは訳文2ですね。")
console.log(sm.ratio());
// 0.6666666666666666
console.log(sm.quickRatio());
// 0.6666666666666666
console.log(sm.realQuickRatio());
// 0.8888888888888888
console.log(sm.getOpcodes());
/*
[
  [ 'equal', 0, 3, 0, 3 ],
  [ 'replace', 3, 4, 3, 4 ],
  [ 'equal', 4, 5, 4, 5 ],
  [ 'replace', 5, 6, 5, 6 ],
  [ 'equal', 6, 8, 6, 8 ],
  [ 'insert', 8, 8, 8, 10 ]
]
*/
```

Pythonのドキュメントにもあるように、ある固定の文字列 **a** と複数の文字列 **\[b1, b2, b3, b4...\]** を連続して比較する場合、seq2に固定の文字列を入れた方が実行速度が速くなる。

```js

const a = 'これは原文１です'
const bs = [
  'これは訳文１です'
  'これは訳文10です'
  'これは訳文ですか'
  'これは訳文ではありません'
  'これが訳文です。'
]
// A）やってしまいがちな遅い実装
sm.setSeq1(a)
for (const b of bs) {
  sm.setSeq2(b)
  console.log(sm.ratio())
}

// B）より好ましい実装
sm.setSeq2(a)
for (const b of bs) {
  sm.setSeq1(b)
  console.log(sm.ratio())
}

```

ところが、差分箇所を取得する **sequenceMathcer.getOpcodes()** は常に seq1 を seq2 に修正する方向で計算する。

そのため、「ある特定の文を複数の文と繰り返し比較して、その中で最も近しいものの差分箇所を表示させる」というニーズを満たすには、Aの実装がより分かりやすくなってしまう。

そこでこのコードでは新たに **sequenceMathcer.getOpcodesA2B()** と **sequenceMathcer.getOpcodesB2A()** を加えている。
これによりseq2 を seq1 に修正するための Opcode を取得しやすくしている。

また内部的には **sequenceMathcer.getOpcodes()** に 引数として **false** を渡すと **sequenceMathcer.getOpcodesB2A()** の結果を得ることができる。

```js
console.log(sm.getOpcodesA2B());
/*
[
  [ 'equal', 0, 3, 0, 3 ],
  [ 'replace', 3, 4, 3, 4 ],
  [ 'equal', 4, 5, 4, 5 ],
  [ 'replace', 5, 6, 5, 6 ],
  [ 'equal', 6, 8, 6, 8 ],
  [ 'insert', 8, 8, 8, 10 ]
]
*/

console.log(sm.getOpcodesB2A());
/*
[
  [ 'equal', 0, 3, 0, 3 ],
  [ 'replace', 3, 4, 3, 4 ],
  [ 'equal', 4, 5, 4, 5 ],
  [ 'replace', 5, 6, 5, 6 ],
  [ 'equal', 6, 8, 6, 8 ],
  [ 'delete', 8, 10, 8, 8 ]
]
*/

console.log(sm.getOpcodes(false));
/*
[
  [ 'equal', 0, 3, 0, 3 ],
  [ 'replace', 3, 4, 3, 4 ],
  [ 'equal', 4, 5, 4, 5 ],
  [ 'replace', 5, 6, 5, 6 ],
  [ 'equal', 6, 8, 6, 8 ],
  [ 'delete', 8, 10, 8, 8 ]
]
getOpcodesB2A() と同じ
*/
```

getOpcodes() を常に getOpcodesB2A() として動作させるには、sequenceMatcher.setDefaultDirection() に引数として文字列 **'B2A'** を渡す。

```js
sm.setDefaultDirection('B2A')
sm.getOpcodes()
/*
[
  [ 'equal', 0, 3, 0, 3 ],
  [ 'replace', 3, 4, 3, 4 ],
  [ 'equal', 4, 5, 4, 5 ],
  [ 'replace', 5, 6, 5, 6 ],
  [ 'equal', 6, 8, 6, 8 ],
  [ 'delete', 8, 10, 8, 8 ]
]
getOpcodesB2A() と同じ
*/
```

最後に applyOpcodes() を呼び出すことで、差分箇所を <span> タグで囲んだ文字列を取得できる。
getOpcodes() と同様に引数として **false** を渡すことで、seq2 を seq1 に修正した文字列を出力する。

```js
console.log(sm.applyOpcodes());
// これは<span class="ins">原</span><span class="del">訳</span>文<span class="ins">１</span><span class="del">2</span>です<span class="ins"></span>ね。
console.log(sm.applyOpcodes(false));
// これは<span class="ins">訳</span><span class="del">原</span>文<span class="ins">2</span><span class="del">１</span>です<span class="ins">ね。</span>

```

## Differ

未実装……