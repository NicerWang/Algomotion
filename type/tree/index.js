import {nonlinear} from "../../motion/index.js";
import {__drawRect, __fillNumber, PromiseQueue} from "../../utils/index.js";

let set;
let ctx;
let pq;
let motion = false;
let mr = null;
let mvs;
let dta = [];
let emphasized = [];
let kfs = [];

/*
    Assist Functions
*/
function __getLayer(idx) {
    let diff = 1
    let layer = 0
    let offset = idx
    while (true) {
        if (diff <= offset) {
            offset -= diff
            diff *= 2
            layer++
        } else break
    }
    return layer + 1
}

function __positionCalculator(idx, newLayerHeight, newBlockSize) {
    let diff = 1
    let layer = 0
    let offset = idx
    while (true) {
        if (diff <= offset) {
            offset -= diff
            diff *= 2
            layer++
        } else break
    }
    let gap = (set.width - diff * newBlockSize) / (diff * 2)
    let x = gap + (gap * 2 + newBlockSize) * offset;
    let y = newLayerHeight * layer + set.offset
    return [x, y]
}

function __defaultMovesReader(mvs, start = 0, isInit = false) {
    if (isInit) {
        kfs.push({
            dta: dta.concat(),
            emphasized: emphasized.concat(),
        });
    }
    for (let i = start; i < mvs.length; i++) {
        let op = mvs[i].match(/([a-z]+)\(([\d,]+)\)/)
        let argus = op[2].split(',').map(Number)
        let kf;
        if (isInit) {
            kf = Object.assign({}, kfs[i])
        }
        if (op[1] === "swap") {
            swapNode(argus[0], argus[1], i)
            if (isInit) {
                kf.emphasized = kf.emphasized.concat()
                for (let i = 0; i < kf.emphasized.length; i++) {
                    kf.emphasized[i] = false;
                }
                kf.dta = kf.dta.concat()
                const t = kf.dta[argus[0]]
                kf.dta[argus[0]] = kf.dta[argus[1]]
                kf.dta[argus[1]] = t;
                kfs.push(kf);
            }
        } else if (op[1] === "get") {
            emphasizeNode(argus[0], true, i)
            if (isInit) {
                kf.emphasized = kf.emphasized.concat()
                kf.emphasized[argus[0]] = true;
                kfs.push(kf);
            }
        } else if (op[1] === "insert") {
            addNode(argus[0], argus[1], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.dta[argus[0]] = argus[1];
                kfs.push(kf);
            }
        } else if (op[1] === "remove") {
            removeNode(argus[0], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.dta[argus[0]] = undefined;
                kfs.push(kf);
            }
        } else {
            addBlank(i)
            if (isInit) {
                kfs.push(kf);
            }
        }
    }
}

function __show(_pos = 0, needClear = false) {
    let showNodeMotion = () => {
        return new Promise((resolve, reject) => {
            if(needClear){
                for (let i = dta.length - 1; i >= 0; i--) {
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
                for (let i = dta.length - 1; i >= 0; i--) {
                    _drawBlock(i, false, false);
                }
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i, false, false);
                    }
                    resolve()
                }
            }, set.fps)
        })
    }
    let showLineMotion = () => {
        return new Promise((resolve, reject) => {
            ctx.globalAlpha = 0;
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                ctx.clearRect(0, 0, set.width, set.height)
                for (let i = dta.length - 1; i >= 0; i--) {
                    _drawBlock(i, false, true, false);
                }
                let temp = ctx.globalAlpha;
                ctx.globalAlpha = 1;
                for (let i = dta.length - 1; i >= 0; i--) {
                    _drawBlock(i, false, false);
                }
                ctx.globalAlpha = temp
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i);
                    }
                    resolve()
                }
            }, set.fps)
        })
    }
    pq.push(showNodeMotion, _pos)
    pq.push(showLineMotion, _pos)
}

function __updateParam() {
    let newLayerHeight = set.layerHeight;
    let newBlockSize = set.blockSize;
    let len;
    for (let i = dta.length - 1; i >= 0; i--) {
        if (dta[i] !== undefined) {
            len = i;
            break
        }
    }
    let newLayer = __getLayer(len)
    if (newLayer * set.layerHeight > set.height) {
        console.info("[AlgoMotion] Block size will be modified to fit screen.")
        let scale = (set.height / newLayer) / set.layerHeight
        newLayerHeight = set.layerHeight * scale
        newBlockSize = set.blockSize * scale
    }
    if (newLayer * set.layerHeight < set.height) {
        console.info("[AlgoMotion] Block size will be modified to fit screen.")
        let scale = (set.height / newLayer) / set.layerHeight
        newLayerHeight = set.layerHeight * scale
        newBlockSize = set.blockSize * scale
    }
    if (newLayerHeight > set.maxLayerHeight) {
        newLayerHeight = set.maxLayerHeight
    }
    if (newBlockSize > set.blockMaxSize) {
        newBlockSize = set.blockMaxSize
    }
    set.layerHeight = newLayerHeight
    set.blockSize = newBlockSize
    set.offset = (newLayerHeight - newBlockSize) / 2
    return [newLayerHeight, newBlockSize]
}

/*
    Draw Functions
*/
function _line(fromX, fromY, toX, toY, isEmphasized = false) {
    let temp = ctx.lineWidth;
    ctx.lineWidth = 10
    ctx.strokeStyle = set.fillColor;
    if (isEmphasized) {
        ctx.lineWidth = 15
        ctx.strokeStyle = set.emphasisTextColor
    }
    ctx.beginPath();
    ctx.moveTo(fromX + set.blockSize / 2, fromY + set.blockSize / 2);
    ctx.lineTo(toX + set.blockSize / 2, toY + set.blockSize / 2);
    ctx.stroke();
    ctx.lineWidth = temp;

}

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

function _drawBlock(idx, needClear = false, drawLine = true, drawBlock = true) {
    if (dta[idx] === undefined) return;
    const [x, y] = __positionCalculator(idx, set.layerHeight, set.blockSize);
    if (needClear) {
        ctx.clearRect(x - ctx.lineWidth, y - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    }
    if (idx !== 0 && drawLine) {
        const [x_f, y_f] = __positionCalculator(Math.floor((idx - 1) / 2), set.layerHeight, set.blockSize)
        _line(x, y, x_f, y_f)
    }
    if (!drawBlock) return
    if (!emphasized[idx]) {
        _rect(dta[idx], x, y, set.blockSize, set.blockSize, set.blockSize / 2)
    } else {
        _emphasizeRect(dta[idx], x, y, set.blockSize, set.blockSize, set.blockSize / 2)
    }
}

/*
    Motion Functions
*/
function _swap(idx1, idx2, _pos = 0) {
    let swapMotion = () => {
        return new Promise((resolve, reject) => {
            let process = 0;
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
                    ctx.clearRect(0, 0, set.width, set.height);
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    setTimeout(() => {
                        for (let i = dta.length - 1; i >= 0; i--) {
                            emphasized[i] = false;
                        }
                        for (let i = dta.length - 1; i >= 0; i--) {
                            _drawBlock(i)
                        }
                        resolve()
                    }, set.staticTime * 5)
                    return
                }
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(0, 0, set.width, set.height)
                const [x1, y1] = __positionCalculator(idx1, set.layerHeight, set.blockSize)
                const [x2, y2] = __positionCalculator(idx2, set.layerHeight, set.blockSize)
                for (let i = dta.length - 1; i >= 0; i--) {
                    if (i === idx1 || i === idx2) continue;
                    _drawBlock(i)
                }
                _line(x1 + (x2 - x1) * process / 100, y1 + (y2 - y1) * process / 100, x2 + (x1 - x2) * process / 100, y2 + (y1 - y2) * process / 100, true)

                _emphasizeRect(dta[idx1], x1 + (x2 - x1) * process / 100, y1 + (y2 - y1) * process / 100, set.blockSize, set.blockSize, set.blockSize / 2)
                _emphasizeRect(dta[idx2], x2 + (x1 - x2) * process / 100, y2 + (y1 - y2) * process / 100, set.blockSize, set.blockSize, set.blockSize / 2)
                process += nonlinear(process, set.speed)
            }, set.fps);
        })
    }
    pq.push(swapMotion, _pos)
}

function _remove(idx, _pos = 0) {
    let shrinkMotion = () => {
        return new Promise((resolve, reject) => {
            const [x, y] = __positionCalculator(idx, set.layerHeight, set.blockSize);
            const [x_f, y_f] = __positionCalculator(Math.floor((idx - 1) / 2), set.layerHeight, set.blockSize);
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
                    for (let i = dta.length - 1; i >= 0; i--) {
                        if (i === idx) _drawBlock(i, false, false)
                        else _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height)
                _line(x, y, x + (x_f - x) * (100 - process) / 100, y + (y_f - y) * (100 - process) / 100)
                for (let i = dta.length - 1; i >= 0; i--) {
                    if (i === idx) _drawBlock(i, false, false)
                    else _drawBlock(i)
                }
                process += nonlinear(process, set.speed)
            }, set.fps)
        })
    }
    let removeMotion = () => {
        return new Promise((resolve, reject) => {
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                _drawBlock(idx, true, false)
                ctx.globalAlpha -= 0.025
                if (ctx.globalAlpha < 0.1) {
                    ctx.globalAlpha = 0
                    _drawBlock(idx, true, false)
                    ctx.globalAlpha = 1
                    dta[idx] = undefined;
                    emphasized[idx] = false;
                    __updateParam()
                    ctx.clearRect(0, 0, set.width, set.height);
                    for (let i = dta.length; i >= 0; i--) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                }
            }, set.fps)
        });
    }
    pq.push(shrinkMotion, _pos)
    pq.push(removeMotion, _pos)
}

function _add(idx, num, _pos = 0) {
    let addMotion = () => {
        return new Promise((resolve, reject) => {
            dta[idx] = num;
            ctx.clearRect(0, 0, set.width, set.height);
            __updateParam()
            for (let i = dta.length - 1; i >= 0; i--) {
                if (i === idx) continue;
                _drawBlock(i)
            }
            ctx.globalAlpha = 0
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                _drawBlock(idx, false, false);
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    _drawBlock(idx, false, false);
                    clearInterval(timer)
                    resolve()
                }
            }, set.fps)
        })
    }
    let extendMotion = () => {
        return new Promise((resolve, reject) => {
            const [x, y] = __positionCalculator(idx, set.layerHeight, set.blockSize);
            const [x_f, y_f] = __positionCalculator(Math.floor((idx - 1) / 2), set.layerHeight, set.blockSize);
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
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                _line(x, y, x + (x_f - x) * process / 100, y + (y_f - y) * process / 100)
                _drawBlock(idx, false, false);
                _drawBlock(Math.floor((idx - 1) / 2), false, false);
                process += nonlinear(process, set.speed)
            }, set.fps)
        })
    }
    pq.push(addMotion, _pos)
    pq.push(extendMotion, _pos)
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
        blockMaxSize: setting.blockSize ? setting.blockSize * dpr : 80 * dpr,
        maxLayerHeight: setting.layerHeight ? setting.layerHeight * dpr : 140 * dpr,
        emphasisColor: setting.emphasisColor ? setting.emphasisColor : '#bedce3',
        emphasisTextColor: setting.emphasisTextColor ? setting.emphasisTextColor : '#1c474d',
        textColor: setting.textColor ? setting.textColor : '#eefcf5',
        fillColor: setting.fillColor ? setting.fillColor : '#14cdc8',
        font: setting.font ? setting.font * dpr : 20 * dpr,
        fps: setting.fps ? 1000 / setting.fps : 1000 / 60,
        speed: setting.speed ? setting.speed : 1.0,
        staticTime: setting.staticTime ? setting.staticTime / 10 : 80
    };
    set.layerHeight = set.maxLayerHeight
    set.blockSize = set.blockMaxSize
    let info = {
        dta: information.dta ? information.dta : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        mvs: information.mvs ? information.mvs : []
    };
    element.setAttribute('width', set.width)
    element.setAttribute('height', set.height)
    element.setAttribute('style', "width:" + set.width / dpr + "px;height:" + set.height / dpr + "px")
    ctx = element.getContext('2d')
    pq = new PromiseQueue(setting.motion,setting.position)
    if (!ctx) {
        alert("[AlgoMotion][Error] Your browser does not support canvas!")
        return
    }
    dta = info.dta
    emphasized.length = dta.length
    __updateParam()
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
    emphasized = kfs[pos].emphasized.concat();
    dta = kfs[pos].dta.concat();
    __updateParam()
    ctx.clearRect(0, 0, set.width, set.height)
    for (let i = dta.length - 1; i >= 0; i--) {
        _drawBlock(i)
    }
    setTimeout(() => {
        mr(mvs, pos)
    }, set.staticTime * 5)
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
    emphasized = null
    dta = [];
    emphasized = [];
    kfs = [];
}

function swapNode(idx1, idx2, _pos) {
    _swap(idx1, idx2, _pos);
}

function emphasizeNode(idx, status, _pos = 0) {
    let emphasizeMotion = () => {
        return new Promise((resolve, reject) => {
            const [x, y] = __positionCalculator(idx, set.layerHeight, set.blockSize);
            emphasized[idx] = status
            _drawBlock(idx, false)
            _drawBlock(Math.floor((idx - 1) / 2), false, false)
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
            }, set.staticTime)
        })
    }
    pq.push(emphasizeMotion, _pos)
}

function clear(_idx = 0) {
    __show(_idx,true);
}

function addBlank(_pos = 0) {
    let blackMotion = () => {
        return new Promise((resolve, reject) => {
            let process = 0
            let timer = setInterval(function () {
                if (pq.stopped) {
                    pq.lock = false
                    clearInterval(timer)
                    return
                }
                if (pq.paused) return;
                process += 10
                if (process >= 100) {
                    resolve()
                }
            }, set.staticTime)
        })
    }
    pq.push(blackMotion, _pos)
}

function removeNode(idx, _pos) {
    _remove(idx, _pos)
}

function addNode(idx, num, _pos = 0) {
    _add(idx, num, _pos)
}

export {
    init,
    destroy,
    setPosition,
    setMovesReader,
    pause,
    clear,
    swapNode,
    emphasizeNode,
    removeNode,
    addNode,
}