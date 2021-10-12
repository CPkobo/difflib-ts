"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceMatcher = void 0;
class SequenceMatcher {
    isjunk;
    a;
    b;
    autojunk;
    matchingBlocks;
    opcodes;
    opIsA2B;
    fullbcount;
    b2j;
    bjunk;
    bpopular;
    constructor(isjunk = null, a = '', b = '', autojunk = true, opDirection = 'A2B') {
        this.isjunk = isjunk;
        this.a = '';
        this.b = '';
        this.autojunk = autojunk;
        this.matchingBlocks = [];
        this.opcodes = [];
        this.opIsA2B = opDirection === 'A2B';
        this.fullbcount = {};
        this.b2j = {};
        this.bjunk = [];
        this.bpopular = [];
        this.setSeqs(a, b);
    }
    setDefaultDirection(opDirection = 'A2B') {
        if (opDirection === 'A2B') {
            this.opIsA2B = true;
        }
        else if (opDirection === 'B2A') {
            this.opIsA2B = false;
        }
    }
    calculate_ratio(matches, length) {
        if (length > 0) {
            return 2.0 * matches / length;
        }
        else {
            return 1.0;
        }
    }
    range(start, end = 0) {
        let start_ = 0;
        let end_ = 0;
        if (end === 0) {
            end_ = start;
        }
        else {
            start_ = start;
            end_ = end;
        }
        const range_ = [];
        for (let i = start_; i < end_; i++) {
            range_.push(i);
        }
        return range_;
    }
    setSeqs(a, b) {
        this.setSeq1(a);
        this.setSeq2(b);
    }
    setSeq1(a) {
        if (a !== this.a) {
            this.a = a;
            this.matchingBlocks = [];
            this.opcodes = [];
        }
    }
    setSeq2(b) {
        if (b !== this.b) {
            this.b = b;
            this.matchingBlocks = [];
            this.opcodes = [];
            this.fullbcount = {};
            this._chainB();
        }
    }
    _chainB() {
        const b = this.b;
        this.b2j = {};
        for (let i = 0; i < b.length; i++) {
            const elt = b[i];
            if (this.b2j[elt] === undefined) {
                this.b2j[elt] = [i];
            }
            else {
                this.b2j[elt].push(i);
            }
        }
        this.bjunk = [];
        const isjunk = this.isjunk;
        if (isjunk) {
            for (const key of Object.keys(this.b2j)) {
                if (isjunk(key)) {
                    if (this.bjunk.indexOf(key) === -1) {
                        this.bjunk.push(key);
                    }
                }
            }
            for (const elt of Object.keys(this.bjunk)) {
                delete this.b2j[elt];
            }
        }
        const n = b.length;
        this.bpopular.length = 0;
        if (this.autojunk && n >= 200) {
            let ntest = n;
            for (const key of Object.keys(this.b2j)) {
                const indices = this.b2j[key];
                if (indices.length > ntest) {
                    if (this.bpopular.indexOf(key) === -1) {
                        this.bpopular.push(key);
                    }
                }
            }
            for (const elt of this.bpopular) {
                delete this.b2j[elt];
            }
        }
    }
    findLongestMatch(alo, ahi, blo, bhi) {
        const a = this.a;
        const b = this.b;
        let besti = alo;
        let bestj = blo;
        let bestsize = 0;
        let j2len = {};
        for (const i of this.range(alo, ahi)) {
            const newj2len = {};
            const elt = a[i];
            const indices = this.b2j[elt] || [];
            for (const j of indices) {
                if (j < blo) {
                    continue;
                }
                else if (j >= bhi) {
                    break;
                }
                const k = j2len[j - 1] ? j2len[j - 1] + 1 : 1;
                newj2len[j] = k;
                if (k > bestsize) {
                    besti = i - k + 1;
                    bestj = j - k + 1;
                    bestsize = k;
                }
            }
            j2len = newj2len;
        }
        while (besti > alo &&
            bestj > blo &&
            this.bjunk.indexOf(b[bestj - 1]) !== -1 &&
            a[besti - 1] == b[bestj - 1]) {
            besti--;
            bestj--;
            bestsize++;
        }
        while (besti + bestsize < ahi &&
            bestj + bestsize < bhi &&
            this.bjunk.indexOf(b[bestj + bestsize]) !== -1 &&
            a[besti + bestsize] === b[bestj + bestsize]) {
            bestsize++;
        }
        while (besti > alo &&
            bestj > blo &&
            this.bjunk.indexOf(b[bestj - 1]) !== -1 &&
            a[besti - 1] === b[bestj - 1]) {
            besti--;
            bestj--;
            bestsize++;
        }
        while (besti + bestsize < ahi &&
            bestj + bestsize < bhi &&
            this.bjunk.indexOf(b[bestj + bestsize]) !== -1 &&
            a[besti + bestsize] == b[bestj + bestsize]) {
            bestsize++;
        }
        return [besti, bestj, bestsize];
    }
    getMatchingBlocks() {
        if (this.matchingBlocks.length > 0) {
            return this.matchingBlocks;
        }
        else {
            const la = this.a.length;
            const lb = this.b.length;
            const queue = [[0, la, 0, lb]];
            const matchingBlocks = [];
            while (queue.length > 0) {
                const q = queue.pop() || [0, 0, 0, 0];
                const alo = q[0];
                const ahi = q[1];
                const blo = q[2];
                const bhi = q[3];
                const x = this.findLongestMatch(alo, ahi, blo, bhi);
                const i = x[0];
                const j = x[1];
                const k = x[2];
                if (k > 0) {
                    matchingBlocks.push(x);
                    if (alo < i && blo < j) {
                        queue.push([alo, i, blo, j]);
                    }
                    if (i + k < ahi && j + k < bhi) {
                        queue.push([i + k, ahi, j + k, bhi]);
                    }
                }
            }
            matchingBlocks.sort((a, b) => {
                if (a[0] > b[0]) {
                    return 1;
                }
                else if (a[0] < b[0]) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            let i1 = 0;
            let j1 = 0;
            let k1 = 0;
            const nonAdjacent = [];
            for (const m of matchingBlocks) {
                const i2 = m[0];
                const j2 = m[1];
                const k2 = m[2];
                if ((i1 + k1 === i2) && (j1 + k1 === j2)) {
                    k1 += k2;
                }
                else {
                    if (k1 > 0) {
                        nonAdjacent.push([i1, j1, k1]);
                    }
                    i1 = i2;
                    j1 = j2;
                    k1 = k2;
                }
            }
            if (k1 > 0) {
                nonAdjacent.push([i1, j1, k1]);
            }
            nonAdjacent.push([la, lb, 0]);
            this.matchingBlocks = nonAdjacent;
            return this.matchingBlocks;
        }
    }
    getOpcodes(isA2B) {
        const opIsA2B = isA2B === undefined ? this.opIsA2B : isA2B;
        if (opIsA2B) {
            return this.getOpcodesA2B();
        }
        else {
            return this.getOpcodesB2A();
        }
    }
    getOpcodesA2B() {
        if (this.opcodes.length > 0 && this.opIsA2B) {
            return this.opcodes;
        }
        else {
            let i = 0;
            let j = 0;
            const answer = [];
            for (const m of this.getMatchingBlocks()) {
                let tag = '';
                const ai = m[0];
                const bj = m[1];
                const size = m[2];
                if (i < ai && j < bj) {
                    tag = 'replace';
                }
                else if (i < ai) {
                    tag = 'delete';
                }
                else if (j < bj) {
                    tag = 'insert';
                }
                if (tag !== '') {
                    answer.push([tag, i, ai, j, bj]);
                }
                i = ai + size;
                j = bj + size;
                if (size > 0) {
                    answer.push(['equal', ai, i, bj, j]);
                }
            }
            this.opcodes = answer;
            return answer;
        }
    }
    getOpcodesB2A() {
        if (this.opcodes.length > 0 && !this.opIsA2B) {
            return this.opcodes;
        }
        else {
            let i = 0;
            let j = 0;
            const answer = [];
            for (const m of this.getMatchingBlocks()) {
                let tag = '';
                const ai = m[0];
                const bj = m[1];
                const size = m[2];
                if (i < ai && j < bj) {
                    tag = 'replace';
                }
                else if (i < ai) {
                    tag = 'insert';
                }
                else if (j < bj) {
                    tag = 'delete';
                }
                if (tag !== '') {
                    answer.push([tag, j, bj, i, ai]);
                }
                i = ai + size;
                j = bj + size;
                if (size > 0) {
                    answer.push(['equal', bj, j, ai, i]);
                }
            }
            this.opcodes = answer;
            return answer;
        }
    }
    getGroupedOpcodes(n = 3) {
        let tag;
        let i1;
        let i2;
        let j1;
        let j2;
        let codes = this.getOpcodes();
        if (codes.length === 0) {
            codes = [['equal', 0, 1, 0, 1]];
        }
        if (codes[0][0] === 'equal') {
            tag = codes[0][0];
            i1 = codes[0][1];
            i2 = codes[0][2];
            j1 = codes[0][3];
            j2 = codes[0][4];
            codes[0] = [tag, Math.max(i1, i2 - n), i2, Math.max(j1, j2 - n), j2];
        }
        const last = codes.length - 1;
        if (codes[last][0] === 'equal') {
            tag = codes[last][0];
            i1 = codes[last][1];
            i2 = codes[last][2];
            j1 = codes[last][3];
            j2 = codes[last][4];
            codes[last] = [tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)];
        }
        const nn = n + n;
        const groups = [];
        let group = [];
        for (const code of codes) {
            tag = code[0];
            i1 = code[1];
            i2 = code[2];
            j1 = code[3];
            j2 = code[4];
            if ((tag === 'equal') && ((i2 - i1) > nn)) {
                group.push([tag, i1, Math.min(i2, i1 + n), j1, Math.min(j2, j1 + n)]);
                groups.push(group.slice());
                group = [];
                i1 = Math.max(i1, i2 - n);
                j1 = Math.max(j1, j2 - n);
            }
            group.push([tag, i1, i2, j1, j2]);
        }
        if (group.length > 0 && !((group.length === 1) && (group[0][0] === 'equal'))) {
            groups.push(group);
        }
        return groups;
    }
    ratio() {
        let matches = 0;
        for (const m of this.getMatchingBlocks()) {
            matches += m[2];
        }
        return this.calculate_ratio(matches, this.a.length + this.b.length);
    }
    quickRatio() {
        if (Object.keys(this.fullbcount).length === 0) {
            for (let i = 0; i < this.b.length; i++) {
                const elt = this.b[i];
                if (this.fullbcount[elt] === undefined) {
                    this.fullbcount[elt] = 1;
                }
                else {
                    this.fullbcount[elt]++;
                }
            }
        }
        const avail = {};
        let matches = 0;
        for (let i = 0; i < this.a.length; i++) {
            const elt = this.a[i];
            const numb = avail[elt] || this.fullbcount[elt] || 0;
            avail[elt] = numb - 1;
            if (numb > 0) {
                matches++;
            }
        }
        return this.calculate_ratio(matches, this.a.length + this.b.length);
    }
    realQuickRatio() {
        const la = this.a.length;
        const lb = this.b.length;
        return this.calculate_ratio(Math.min(la, lb), la + lb);
    }
    applyOpcodes(isA2B = true) {
        if (this.a === '' || this.b === '') {
            return '';
        }
        // OpcodeのDelete / Replace 用にオリジナルテキストをとっておく
        const crtSegment = isA2B ? this.a : this.b;
        // 類似テキストを一つずつ取得して処理
        let tagged = isA2B ? this.b : this.a;
        const processCodes = this.getOpcodes(isA2B).reverse();
        for (const processCode of processCodes) {
            switch (processCode[0]) {
                case 'equal':
                    break;
                case 'delete':
                    tagged =
                        tagged.slice(0, processCode[3]) +
                            '<span class="ins">' + crtSegment.slice(processCode[1], processCode[2]) + '</span>' +
                            tagged.slice(processCode[4]);
                    break;
                case 'replace':
                    tagged =
                        tagged.slice(0, processCode[3]) +
                            '<span class="ins">' + crtSegment.slice(processCode[1], processCode[2]) + '</span>' +
                            '<span class="del">' + tagged.slice(processCode[3], processCode[4]) + '</span>' +
                            tagged.slice(processCode[4]);
                    break;
                case 'insert':
                    tagged =
                        tagged.slice(0, processCode[3]) +
                            '<span class="del">' + tagged.slice(processCode[3], processCode[4]) + '</span>' +
                            tagged.slice(processCode[4]);
                    break;
                default:
                    break;
            }
        }
        return tagged;
    }
}
exports.SequenceMatcher = SequenceMatcher;
