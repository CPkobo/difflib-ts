import { SequenceMatcher } from './sequenceMatcher'

const sm = new SequenceMatcher()
const seqs = [
  "これは原文1です。",
  "これは原文2です。",
  "これは原文3です。",
  "これは原文4です。",
  "これは原文5です。",
  "これは原文6です。",
  "これは原文7です。",
  "これは原文8です。",
  "これは原文9です。",
  "これは原文10です。",
  "これは原文11です。",
  "これは原文12です。",
  "これは原文13です。",
  "これは原文14です。",
  "これは原文15です。",
  "これは原文16です。",
  "これは原文17です。",
  "これは原文18です。",
  "これは原文19です。",
  "これは原文20です。",
  "これは原文21です。",
  "これは原文22です。",
  "これは原文23です。",
  "これは原文24です。",
  "これは原文25です。",
  "これは原文26です。",
  "これは原文27です。",
  "これは原文28です。",
  "これは原文29です。",
  "これは原文30です。",
  "これは原文31です。",
  "これは原文32です。",
  "これは原文33です。",
  "これは原文34です。",
  "これは原文35です。",
  "これは原文36です。",
  "これは原文37です。",
  "これは原文38です。",
  "これは原文39です。",
  "これは原文40です。",
  "これは原文41です。",
  "これは原文42です。",
  "これは原文43です。",
  "これは原文44です。",
  "これは原文45です。",
  "これは原文46です。",
  "これは原文47です。",
  "これは原文48です。",
  "これは原文49です。",
  "これは原文50です。",
]
const result1 = []
const st1 = new Date()
for (let i = 0; i < seqs.length; i++) {
  sm.setSeq1(seqs[i])
  for (let j = 0; j < i; j++) {
    sm.setSeq2(seqs[j])
    result1.push(sm.ratio())
  }
}
const end1 = new Date()

const result2 = []
const st2 = new Date()
for (let i = 0; i < seqs.length; i++) {
  sm.setSeq2(seqs[i])
  for (let j = 0; j < i; j++) {
    sm.setSeq1(seqs[j])
    result2.push(sm.ratio())
  }
}
const end2 = new Date()

console.log(st1)
console.log(end1)
console.log(st2)
console.log(end2)