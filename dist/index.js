"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequenceMatcher_1 = require("./sequenceMatcher");
const sm = new sequenceMatcher_1.SequenceMatcher();
sm.setSeqs("これは原文１です", "これは訳文2ですね。");
console.log(sm.ratio());
console.log(sm.quickRatio());
console.log(sm.realQuickRatio());
console.log(sm.getOpcodes());

console.log(sm.getOpcodesA2B());
console.log(sm.getOpcodesB2A());
console.log(sm.getOpcodes(false));

console.log(sm.applyOpcodes());
console.log(sm.applyOpcodes(false));
