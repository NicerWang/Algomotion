import {threeBezier} from '../../bezier/index.js';
import {nonlinear} from "../../motion/index.js";
import {__drawRect, __fillNumber, PromiseQueue} from "../../utils/index.js";

let set;
let ctx;
let pq;
let motion = false;
let mr = null;
let mvs;
let dta = [];
let barrier = [];
let emphasized = [];
let kfs = [];

let gap;
let mid;

/*
    Assist Functions
*/
function __defaultMovesReader(mvs, start = 0, isInit = false) {
    if (isInit) {
        kfs.push({
            dta: dta.concat(),
            emphasized: emphasized.concat(),
            barrier: barrier.concat()
        });
    }
    for (let i = start; i < mvs.length; i++) {
        let op = mvs[i].match(/([a-z]+)\(([\d,]*)\)/)
        let argus = null
        if (op[2]) {
            argus = op[2].split(',').map(Number)
        }
        let kf;
        if (isInit) {
            kf = Object.assign({}, kfs[i])
        }
        if (op[1] === "swap") {
            swapBlock(argus[0], argus[1], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                const t = kf.dta[argus[0]]
                kf.dta[argus[0]] = kf.dta[argus[1]]
                kf.dta[argus[1]] = t;
                kfs.push(kf);
            }
        } else if (op[1] === "get") {
            emphasizeBlock(argus[0], true, i)
            emphasizeBlock(argus[0], false, i)
            if (isInit) {
                kfs.push(kf);
            }
        } else if (op[1] === "remove") {
            removeBlock(argus[0], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.emphasized = kf.emphasized.concat()
                kf.barrier = kf.barrier.concat()
                kf.dta.splice(argus[0], 1);
                kf.emphasized.splice(argus[0], 1);
                kf.barrier.splice(argus[0], 1);
                kfs.push(kf);
            }
        } else if (op[1] === "add") {
            addBlock(argus[0], argus[1], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.emphasized = kf.emphasized.concat()
                kf.barrier = kf.barrier.concat()
                kf.dta.splice(argus[0], 0, argus[1]);
                kf.emphasized.splice(argus[0], 0, false);
                kf.barrier.splice(argus[0], 0, false);
                kfs.push(kf);
            }
        } else if (op[1] === "bar") {
            addBarrier(argus[0], i)
            if (isInit) {
                kf.barrier = kf.barrier.concat()
                kf.barrier[argus[0]] = true
                kfs.push(kf);
            }
        } else if (op[1] === "cls") {
            clear(i)
            if (isInit) {
                kf.barrier = kf.barrier.concat()
                kf.emphasized = kf.emphasized.concat()
                for (let i = 0; i < kf.dta.length; i++) {
                    kf.barrier[i] = false;
                    kf.emphasized[i] = false;
                }
                kfs.push(kf);
            }
        }
    }
}

function __show(_pos = 0, needClear) {
    let showMotion = () => {
        return new Promise((resolve, reject) => {
            if (needClear) {
                for (let i = 0; i < dta.length; i++) {
                    barrier[i] = false;
                    emphasized[i] = false;
                }
            }
            ctx.globalAlpha = 0;
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                ctx.clearRect(0, 0, set.width, set.height)
                for (let i = 0; i < dta.length; i++) {
                    _drawBlock(i);
                }
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = 0; i < dta.length; i++) {
                        _drawBlock(i);
                    }
                    resolve()

                }
            }, set.fps)
        })
    }
    pq.push(showMotion, _pos)
}

function __updateGap(length) {
    if (length * (set.blockSize + 4) > set.width) {
        console.info("[AlgoMotion] Block size will be modified to fit screen.")
        set.blockSize = Math.floor(set.width / length) - 4
    }
    if (length * (set.blockSize + 4) < set.width && length * (set.blockMaxSize + 4) < set.width) {
        console.info("[AlgoMotion] Block size will be modified to fit screen.")
        set.blockSize = set.blockMaxSize
    }
    return Math.min((set.width - length * set.blockSize) / (length + 2), set.maxGap)
}

/*
    Draw Functions
*/
function _rect(num, x, y, w, h, r) {
    ctx.fillStyle = set.fillColor;
    __drawRect(x, y, w, h, r, ctx);
    ctx.fillStyle = set.textColor;
    __fillNumber(num, set.font, x, y, w, h, ctx);
}

function _emphasizeRect(num, x, y, w, h, r) {
    ctx.fillStyle = set.emphasisColor;
    __drawRect(x, y, w, h, r, ctx);
    ctx.fillStyle = set.emphasisTextColor;
    __fillNumber(num, set.font + 5, x, y, w, h, ctx);
}

function _drawBlock(idx, isEmphasized = false, needClear = false) {
    let pos = gap + (gap + set.blockSize) * idx;
    if (needClear) {
        ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    }
    if (!isEmphasized && !emphasized[idx]) {
        _rect(dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius)
    } else {
        _emphasizeRect(dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius)
    }
    if (barrier[idx]) {
        _drawBarrier(pos)
    }
}

function _drawBarrier(pos) {
    ctx.fillStyle = set.barrierColor
    ctx.beginPath();
    ctx.moveTo(pos + set.blockSize / 10, mid - set.blockSize / 4);
    ctx.lineTo(pos - gap - set.blockSize / 10, mid - set.blockSize / 4);
    ctx.lineTo(pos - gap / 2 - ctx.lineWidth * 2, mid);
    ctx.lineTo(pos - gap / 2 - ctx.lineWidth * 2, mid + ctx.lineWidth * 2 + set.blockSize);
    ctx.lineTo(pos - gap - set.blockSize / 10, mid + ctx.lineWidth * 2 + set.blockSize + set.blockSize / 4);
    ctx.lineTo(pos + set.blockSize / 10, mid + ctx.lineWidth * 2 + set.blockSize + set.blockSize / 4);
    ctx.lineTo(pos - gap / 2 + ctx.lineWidth * 2, mid + ctx.lineWidth * 2 + set.blockSize);
    ctx.lineTo(pos - gap / 2 + ctx.lineWidth * 2, mid);
    ctx.fill();
}

/*
    Motion Functions
*/
function _swap(idx1, idx2, p1x, p1y, p2x, mid, offset, _pos) {
    let swapMotion = () => {
        return new Promise((resolve, reject) => {
            let p1x = gap + (set.blockSize + gap) * idx1
            let p2x = gap + (set.blockSize + gap) * idx2
            let changedX = Math.min(p1x, p2x) - ctx.lineWidth;
            let changedY = mid - ctx.lineWidth - offset;
            let changedWidth = ctx.lineWidth * 2 + set.blockSize + Math.max(p2x - p1x, p1x - p2x);
            let changedHeight = ctx.lineWidth + Math.abs(offset) * 2 + set.blockSize;
            let process = 0;
            let x1 = p1x;
            let y1 = mid;
            let x2 = p2x;
            let y2 = mid;
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                if (process > 100) {
                    let t = dta[idx1];
                    dta[idx1] = dta[idx2];
                    dta[idx2] = t;
                    ctx.clearRect(changedX, changedY, changedWidth, changedHeight);
                    for (let i = idx1; i <= idx2; i++) {
                        _drawBlock(i)
                    }
                    if (idx2 + 1 < dta.length) {
                        _drawBlock(idx2 + 1)
                    }
                    if (barrier[idx1]) {
                        _drawBarrier(gap + (gap + set.blockSize) * idx1)
                    }
                    clearInterval(timer)
                    setTimeout(() => {
                        for (let i = 0; i < emphasized.length; i++) {
                            emphasized[i] = false;
                        }
                        for (let i = idx1; i <= idx2; i++) {
                            _drawBlock(i)
                        }
                        resolve()
                    }, 200)
                    return
                }
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(changedX, changedY, changedWidth, changedHeight);
                if (idx2 + 1 < dta.length) {
                    _drawBlock(idx2 + 1)
                }
                if (barrier[idx1]) {
                    _drawBarrier(gap + (gap + set.blockSize) * idx1)
                }
                for (let i = idx1 + 1; i < idx2; i++) {
                    _drawBlock(i)
                }
                [x1, y1] = threeBezier(process / 100, [p1x, mid], [p1x, mid + offset], [p2x, mid + offset], [p2x, mid]);
                [x2, y2] = threeBezier(process / 100, [p2x, mid], [p2x, mid - offset], [p1x, mid - offset], [p1x, mid]);
                _emphasizeRect(dta[idx1], x1, y1, set.blockSize, set.blockSize, set.blockRadius)
                _emphasizeRect(dta[idx2], x2, y2, set.blockSize, set.blockSize, set.blockRadius)
                process += nonlinear(process, set.speed)
            }, set.fps);
        })
    }
    pq.push(swapMotion, _pos)
}

function _remove(idx, _pos) {
    let removeMotion = () => {
        return new Promise((resolve, reject) => {
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                _drawBlock(idx, emphasized[idx], true)
                ctx.globalAlpha -= 0.025
                if (ctx.globalAlpha < 0.1) {
                    ctx.globalAlpha = 0
                    _drawBlock(idx, emphasized[idx], true)
                    clearInterval(timer)
                    ctx.globalAlpha = 1
                    resolve()
                }
            }, set.fps)
        });
    }
    let moveMotion = () => {
        return new Promise((resolve, reject) => {
            let newGap = __updateGap(dta.length - 1);
            let process = 0;
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height);
                    gap = newGap;
                    dta.splice(idx, 1);
                    emphasized.splice(idx, 1);
                    barrier.splice(idx, 1);
                    for (let i = 0; i < dta.length; i++) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height);
                let newIdx = 0;
                for (let i = 0; i < dta.length; i++) {
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * i;
                    let endX = newGap + (set.blockSize + newGap) * newIdx;
                    let startY = mid;
                    let endY = mid;
                    newIdx++;
                    _rect(dta[i], startX + (endX - startX) * process / 100, startY + (endY - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius)
                    if (barrier[i]) {
                        _drawBarrier(startX + (endX - startX) * process / 100)
                    }
                }
                process += nonlinear(process, set.speed)
            }, set.fps);
        })
    }
    pq.push(removeMotion, _pos)
    pq.push(moveMotion, _pos)
}

function _add(idx, num, _pos) {
    let moveMotion = () => {
        return new Promise((resolve, reject) => {
            let newGap = __updateGap(dta.length + 1);
            let process = 0;
            barrier.splice(idx, 0, false);
            emphasized.splice(idx, 0, false);
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height);
                    gap = newGap;
                    dta.splice(idx, 0, num);
                    for (let i = 0; i < dta.length; i++) {
                        if (i === idx) continue
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height);
                let oldIdx = 0;
                for (let i = 0; i < dta.length + 1; i++) {
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * oldIdx;
                    let endX = newGap + (set.blockSize + newGap) * i;
                    let startY = mid;
                    let endY = mid;
                    _rect(dta[oldIdx], startX + (endX - startX) * process / 100, startY + (endY - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius)
                    oldIdx++;
                    if (barrier[i]) {
                        _drawBarrier(startX + (endX - startX) * process / 100)
                    }
                }
                process += nonlinear(process, set.speed)
            }, set.fps);
        })
    }
    let addMotion = () => {
        return new Promise((resolve, reject) => {
            let pos = gap + (gap + set.blockSize) * idx;
            ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
            ctx.globalAlpha = 0
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                _drawBlock(idx)
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    _drawBlock(idx)
                    clearInterval(timer)
                    resolve()

                }
            }, set.fps)
        })
    }
    pq.push(moveMotion, _pos)
    pq.push(addMotion, _pos)
}

/*
    User Interfaces
*/
function init(setting, information, element) {
    console.info("[AlgoMotion] Homepage: https://github.com/NicerWang/Algomotion")
    let dpr = window.devicePixelRatio
    if (setting.hidpi === false) {
        dpr = 1
    }
    set = {
        height: setting.height ? setting.height * dpr : 250 * dpr,
        width: setting.width ? setting.width * dpr : 800 * dpr,
        blockMaxSize: setting.blockSize ? setting.blockSize * dpr : 50 * dpr,
        blockSize: setting.blockSize ? setting.blockSize * dpr : 50 * dpr,
        maxGap: setting.maxGap ? setting.maxGap * dpr : 25 * dpr,
        blockRadius: setting.blockRadius ? setting.blockRadius * dpr : 5 * dpr,
        emphasisColor: setting.emphasisColor ? setting.emphasisColor : '#bedce3',
        emphasisTextColor: setting.emphasisTextColor ? setting.emphasisTextColor : '#1c474d',
        textColor: setting.textColor ? setting.textColor : '#eefcf5',
        fillColor: setting.fillColor ? setting.fillColor : '#14cdc8',
        barrierColor: setting.barrierColor ? setting.barrierColor : 'red',
        motionOffset: setting.motionOffset ? setting.motionOffset * dpr : 50 * dpr,
        font: setting.font ? setting.font * dpr : 20 * dpr,
        fps: setting.fps ? 1000 / setting.fps : 1000 / 60,
        speed: setting.speed ? setting.speed : 1.0
    };
    let info = {
        dta: information.dta ? information.dta : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        mvs: information.mvs ? information.mvs : []
    };
    mid = (set.height - set.blockSize) / 2
    element.setAttribute('width', set.width)
    element.setAttribute('height', set.height)
    element.setAttribute('style', "width:" + set.width / dpr + "px;height:" + set.height / dpr + "px")
    ctx = element.getContext('2d')
    pq = new PromiseQueue(setting.motion, setting.position)
    if (!ctx) {
        alert("[AlgoMotion][Error] Your browser does not support canvas!")
        return
    }
    dta = info.dta
    barrier.length = dta.length
    emphasized.length = dta.length
    gap = __updateGap(dta.length)
    __show()
    if (setting.motion) {
        motion = true
        mvs = info.mvs
        pq.pause(true)
        if (mr === null) {
            mr = __defaultMovesReader
        }
        mr(mvs, 0, true)
        pq.pause(false)
    }
}

function setMovesReader(movesReader) {
    mr = movesReader;
}

function setPosition(pos) {
    pq.stop()
    ctx.globalAlpha = 1
    barrier = kfs[pos].barrier.concat();
    emphasized = kfs[pos].emphasized.concat();
    dta = kfs[pos].dta.concat();
    gap = __updateGap(dta.length)
    ctx.clearRect(0, 0, set.width, set.height)
    for (let i = 0; i < dta.length; i++) {
        _drawBlock(i)
    }
    setTimeout(() => {
        mr(mvs, pos)
    }, 300)
}

function pause(status) {
    pq.pause(status)
}

function destroy() {
    pq.destroy()
    set = null
    ctx = null
    mr = null
    mvs = null
    dta = null
    barrier = null
    emphasized = null
    dta = [];
    barrier = [];
    emphasized = [];
    kfs = [];
}

function swapBlock(idx1, idx2, _pos = 0) {
    _swap(idx1, idx2, gap + (set.blockSize + gap) * idx1, mid, gap + (set.blockSize + gap) * idx2, mid, set.motionOffset, _pos);
}

function emphasizeBlock(idx, status, _pos = 0) {
    let emphasizeMotion = () => {
        return new Promise((resolve, reject) => {
            let pos = gap + (gap + set.blockSize) * idx;
            ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
            emphasized[idx] = status
            if (status) {
                _drawBlock(idx, true)
            } else {
                _drawBlock(idx, false)
            }
            let process = 0
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                process += 10
                if (process > 100) {
                    resolve()
                }
            }, 30)
        })
    }
    pq.push(emphasizeMotion, _pos)
}

function addBarrier(idx, _pos = 0) {
    let barrierMotion = () => {
        return new Promise((resolve, reject) => {
            barrier[idx] = true;
            _drawBlock(idx)
            setTimeout(() => {
                resolve()
            }, 200)

        })
    }
    pq.push(barrierMotion, _pos)
}

function clear(_pos = 0) {
    __show(_pos, true);
}

function removeBlock(idx, _pos = 0) {
    _remove(idx, _pos)
}

function addBlock(idx, num, _pos = 0) {
    _add(idx, num, _pos)
}

export {
    init,
    destroy,
    setPosition,
    setMovesReader,
    pause,
    clear,
    swapBlock,
    emphasizeBlock,
    removeBlock,
    addBlock,
    addBarrier
}