import {__drawRect, __fillNumber, PromiseQueue} from "../../utils/index.js";
import {force} from "../../utils/force.js";

let set;
let ctx;
let pq;
let motion = false;
let mr = null;
let mvs;
let len;
let dta = [];
let pos = [];
let emphasized = [];
let relation = [];
let kfs = [];

/*
    Assist Functions
*/
function __defaultMovesReader(mvs, start = 0, isInit = false) {
    if (isInit) {
        kfs.push({
            emphasizedNode: emphasized.concat(),
            relation: relation.concat()
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
        if (op[1] === "link") {
            emphasizeLink(argus[0], argus[1], true, i)
            if (isInit) {
                kf.relation = kf.relation.concat()
                kf.relation[argus[0] * len + argus[1]] = 2
                kf.relation[argus[1] * len + argus[0]] = 2
                kfs.push(kf);
            }
        } else if (op[1] === "unlink") {
            emphasizeLink(argus[0], argus[1], false, i)
            if (isInit) {
                kf.relation = kf.relation.concat()
                kf.relation[argus[0] * len + argus[1]] = 1
                kf.relation[argus[1] * len + argus[0]] = 1
                kfs.push(kf);
            }
        } else if (op[1] === "emp") {
            emphasizeNode(argus[0],true, i)
            if (isInit) {
                kf.emphasizedNode = kf.emphasizedNode.concat()
                kf.emphasizedNode[argus[0]] = true
                kfs.push(kf);
            }
        } else if (op[1] === "unemp") {
            emphasizeNode(argus[0],false, i)
            if (isInit) {
                kf.emphasizedNode = kf.emphasizedNode.concat()
                kf.emphasizedNode[argus[0]] = false
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
                    for(let j = dta.length - 1; j >= 0; j--){
                        if(relation[i * len + j] === 2){
                            relation[i * len + j] = 1
                        }
                    }
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
                    _drawBlock(i, false);
                }
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i, false);
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
                    for(let j = dta.length - 1; j >= 0; j--){
                        _drawLine(i,j)
                    }
                }
                let temp = ctx.globalAlpha;
                ctx.globalAlpha = 1;
                for (let i = dta.length - 1; i >= 0; i--) {
                    _drawBlock(i, false);
                }
                ctx.globalAlpha = temp
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = dta.length - 1; i >= 0; i--) {
                        for(let j = dta.length - 1; j >= 0; j--){
                            _drawLine(i,j)
                        }
                    }
                    for (let i = dta.length - 1; i >= 0; i--) {
                        _drawBlock(i, false);

                    }
                    resolve()
                }
            }, set.fps)
        })
    }
    pq.push(showNodeMotion, _pos)
    pq.push(showLineMotion, _pos)
}

function __updateParam(data, edges) {
    console.info("[AlgoMotion] Calculating node positions using force layout.")
    pos = force(data, edges, set.width, set.height, set.blockSize)
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

function _drawBlock(idx, needClear = false) {
    if (dta[idx] === undefined) return;
    const [x, y] = pos[idx];
    if (needClear) {
        ctx.clearRect(x - ctx.lineWidth, y - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    }
    if (!emphasized[idx]) {
        _rect(dta[idx], x, y, set.blockSize, set.blockSize, set.blockSize / 2)
    } else {
        _emphasizeRect(dta[idx], x, y, set.blockSize, set.blockSize, set.blockSize / 2)
    }
}

function _drawLine(idx1, idx2) {
    if(relation[idx1 * len + idx2] === 1 || relation[idx2 * len + idx1] === 1){
        _line(pos[idx1][0], pos[idx1][1], pos[idx2][0], pos[idx2][1])
    }
    else if(relation[idx1 * len + idx2] === 2 || relation[idx2 * len + idx1] === 2){
        _line(pos[idx1][0], pos[idx1][1], pos[idx2][0], pos[idx2][1], true)
    }
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
        blockSize: setting.blockSize ? setting.blockSize * dpr : 40 * dpr,
        emphasisColor: setting.emphasisColor ? setting.emphasisColor : '#bedce3',
        emphasisTextColor: setting.emphasisTextColor ? setting.emphasisTextColor : '#1c474d',
        textColor: setting.textColor ? setting.textColor : '#eefcf5',
        fillColor: setting.fillColor ? setting.fillColor : '#14cdc8',
        font: setting.font ? setting.font * dpr : 20 * dpr,
        fps: setting.fps ? 1000 / setting.fps : 1000 / 60,
        speed: setting.speed ? setting.speed : 1.0,
        staticTime: setting.staticTime ? setting.staticTime / 10 : 80
    };
    let info = {
        dta: information.dta ? information.dta : [0, 1, 2, 3, 4, 5],
        rel: information.rel ? information.rel : [[0,1,0,0,0,0],[0,1,0,0,0,0],[0,1,0,0,0,0],[0,1,0,0,0,0],[0,1,0,0,0,0],[0,1,0,0,0,0]],
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
    relation = info.rel.reduce((a,b)=>{
        return a.concat(b)
    })
    len = dta.length
    emphasized.length = dta.length
    __updateParam(dta, relation)
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
    emphasized = kfs[pos].emphasizedNode.concat();
    relation = kfs[pos].relation.concat()
    ctx.clearRect(0, 0, set.width, set.height)
    for (let i = dta.length - 1; i >= 0; i--) {
        for(let j = 0; j < dta.length; j++){
            _drawLine(i, j)
        }
    }
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
    dta = [];
    emphasized = [];
    relation = [];
    kfs = [];
}

function emphasizeNode(idx, status, _pos = 0) {
    let emphasizeMotion = () => {
        return new Promise((resolve, reject) => {
            const [x, y] = pos[idx];
            emphasized[idx] = status
            _drawBlock(idx, false)
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

function emphasizeLink(idx1, idx2, status, _pos = 0) {
    let emphasizeMotion = () => {
        return new Promise((resolve, reject) => {
            if(status){
                relation[idx1 * len + idx2] = 2
                relation[idx2 * len + idx1] = 2
            }else{
                relation[idx1 * len + idx2] = 1
                relation[idx2 * len + idx1] = 1
            }
            ctx.clearRect(0,0,set.width,set.height)
            for(let i = 0; i < dta.length; i++) {
                for (let j = 0; j < dta.length; j++) {
                    _drawLine(i,j)
                }
            }
            for(let i = 0; i < dta.length; i++) {
                _drawBlock(i)
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

export {
    init,
    destroy,
    setPosition,
    setMovesReader,
    pause,
    clear,
    emphasizeNode,
    emphasizeLink
}