import { SequenceMatcher } from './sequenceMatcher'

const junk: IsJunk = (chara) => { return chara === "１" }
const sm = new SequenceMatcher(junk)
sm.setSeqs("これは原文１です", "これは訳文2ですね。")
console.log(sm.ratio())
console.log(sm.quickRatio())
console.log(sm.realQuickRatio())
console.log(sm.getOpcodes())
console.log(sm.getOpcodesA2B())
console.log(sm.getOpcodesB2A())
console.log(sm.applyOpcodes())
console.log(sm.applyOpcodes(false))