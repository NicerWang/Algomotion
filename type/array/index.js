import {threeBezier} from '../../bezier/index.js'
import {nonlinear} from "../../motion/index.js"
import {_blank, _rect, PromiseQueue} from "../../utils/index.js"

let set 
let ctx 
let pq 
let motion = false 
let mr = null 
let mvs 
let dta = [] 
let barrier = [] 
let emphasized = [] 
let kfs = []
let gap 
let mid 

/*
    Assist Functions
*/
/**
 * @desc 默认字符串数组读取器
 */
function __defaultMovesReader(mvs, start = 0, isInit = false) {
    if (isInit) {
        kfs.push({
            dta: dta.concat(),
            emphasized: emphasized.concat(),
            barrier: barrier.concat()
        }) 
    }
    for (let i = start; i < mvs.length; i++) {
        let op = mvs[i].match(/([a-z]+)\(([\d,]*)\)/)
        let argus = null
        if (op[2]) {
            argus = op[2].split(',').map(Number)
        }
        let kf 
        if (isInit) {
            kf = Object.assign({}, kfs[i])
        }
        if (op[1] === "swap") {
            swapBlock(argus[0], argus[1], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                const t = kf.dta[argus[0]]
                kf.dta[argus[0]] = kf.dta[argus[1]]
                kf.dta[argus[1]] = t 
                kfs.push(kf) 
            }
        } else if (op[1] === "get") {
            emphasizeBlock(argus[0], true, i)
            emphasizeBlock(argus[0], false, i)
            if (isInit) {
                kfs.push(kf) 
            }
        } else if (op[1] === "remove") {
            removeBlock(argus[0], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.barrier = kf.barrier.concat()
                kf.dta.splice(argus[0], 1) 
                kf.barrier.splice(argus[0], 1)
                kfs.push(kf) 
            }
        } else if (op[1] === "add") {
            addBlock(argus[0], argus[1], i)
            if (isInit) {
                kf.dta = kf.dta.concat()
                kf.barrier = kf.barrier.concat()
                kf.dta.splice(argus[0], 0, argus[1]) 
                kf.barrier.splice(argus[0], 0, false)
                kfs.push(kf) 
            }
        } else if (op[1] === "barrier") {
            addBarrier(argus, i)
            if (isInit) {
                kf.barrier = kf.barrier.concat()
                for(let j of argus){
                    kf.barrier[j] = true
                }
                kfs.push(kf) 
            }
        } else if (op[1] === "unbarrier"){
            removeBarrier(argus[0], i)
            if (isInit) {
                kf.barrier = kf.barrier.concat()
                for(let j of argus){
                    kf.barrier[j] = false
                }
                kfs.push(kf)
            }
        } else if (op[1] === "clear") {
            clear(i)
            if (isInit) {
                kf.barrier = kf.barrier.concat()
                for (let i = 0; i < kf.dta.length; i++) {
                    kf.barrier[i] = false 
                }
                kfs.push(kf) 
            }
        } else {
            addBlank(i)
            if (isInit) {
                kfs.push(kf) 
            }
        }
    }
}

/**
 * @desc 动画：从空白开始展示
 */
function __show(_pos = 0, needClear = false) {
    let showMotion = () => {
        return new Promise((resolve, reject) => {
            if (needClear) {
                for (let i = 0; i < dta.length; i++) {
                    barrier[i] = false 
                    emphasized[i] = false 
                }
            }
            ctx.globalAlpha = 0 
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
                ctx.clearRect(0, 0, set.width, set.height)
                for (let i = 0; i < dta.length; i++) {
                    _drawBlock(i) 
                }
                ctx.globalAlpha += 0.025
                if (ctx.globalAlpha > 0.9) {
                    ctx.globalAlpha = 1
                    clearInterval(timer)
                    for (let i = 0; i < dta.length; i++) {
                        _drawBlock(i) 
                    }
                    resolve()
                }
            }, set.fps)
        })
    }
    pq.push(showMotion, _pos)
}

/**
 * @desc 参数更新：块间距离
 */
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
    元素绘制函数
*/
/**
 * @desc 绘制块
 */
function _drawBlock(idx, isEmphasized = false, needClear = false) {
    let pos = gap + (gap + set.blockSize) * idx
    if (needClear) {
        ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth) 
    }
    _rect(dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius, isEmphasized || emphasized[idx], ctx, set)
    if (barrier[idx]) {
        _drawBarrier(pos)
    }
}

/**
 * @desc 绘制分隔符
 */
function _drawBarrier(pos) {
    ctx.fillStyle = set.barrierColor
    ctx.beginPath() 
    ctx.moveTo(pos - gap / 2 - ctx.lineWidth * 2, mid - set.blockSize / 4) 
    ctx.lineTo(pos - gap / 2 - ctx.lineWidth * 2, mid + set.blockSize / 4 + set.blockSize) 
    ctx.lineTo(pos - gap / 2 + ctx.lineWidth * 2, mid + set.blockSize / 4 + set.blockSize) 
    ctx.lineTo(pos - gap / 2 + ctx.lineWidth * 2, mid - set.blockSize / 4) 
    ctx.fill() 
}

/*
    动画函数
*/
/**
 * @desc 交换动画
 */
function _swap(idx1, idx2, p1x, p1y, p2x, mid, offset, _pos) {
    let swapMotion = () => {
        return new Promise((resolve, reject) => {
            let p1x = gap + (set.blockSize + gap) * idx1
            let p2x = gap + (set.blockSize + gap) * idx2
            let changedX = Math.min(p1x, p2x) - ctx.lineWidth 
            let changedY = mid - ctx.lineWidth - offset 
            let changedWidth = ctx.lineWidth * 2 + set.blockSize + Math.max(p2x - p1x, p1x - p2x) 
            let changedHeight = ctx.lineWidth + Math.abs(offset) * 2 + set.blockSize 
            let process = 0 
            let x1 = p1x 
            let y1 = mid 
            let x2 = p2x 
            let y2 = mid 
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
                ctx.fillStyle = 'rgba(255,255,255,0.3)' 
                ctx.fillRect(changedX, changedY, changedWidth, changedHeight) 
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
                _rect(dta[idx1], x1, y1, set.blockSize, set.blockSize, set.blockRadius, false, ctx, set)
                _rect(dta[idx2], x2, y2, set.blockSize, set.blockSize, set.blockRadius, false, ctx, set)
                process += nonlinear(process, set.speed)
                if (process > 100) {
                    let t = dta[idx1] 
                    dta[idx1] = dta[idx2] 
                    dta[idx2] = t 
                    ctx.clearRect(changedX, changedY, changedWidth, changedHeight) 
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
                            emphasized[i] = false 
                        }
                        for (let i = idx1; i <= idx2; i++) {
                            _drawBlock(i)
                        }
                        resolve()
                    }, set.staticTime * 5)
                }
            }, set.fps) 
        })
    }
    pq.push(swapMotion, _pos)
}

/**
 * @desc 删除动画
 */
function _remove(idx, _pos) {
    let removeMotion = () => {
        return new Promise((resolve, reject) => {
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
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
        }) 
    }
    let moveMotion = () => {
        return new Promise((resolve, reject) => {
            let newGap = __updateGap(dta.length - 1) 
            let process = 0 
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height) 
                    gap = newGap 
                    dta.splice(idx, 1) 
                    emphasized.splice(idx, 1) 
                    barrier.splice(idx, 1) 
                    for (let i = 0; i < dta.length; i++) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height) 
                let newIdx = 0 
                for (let i = 0; i < dta.length; i++) {
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * i 
                    let endX = newGap + (set.blockSize + newGap) * newIdx 
                    let startY = mid 
                    let endY = mid 
                    newIdx++ 
                    _rect(dta[i], startX + (endX - startX) * process / 100, startY + (endY - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius, false, ctx, set)
                    if (barrier[i]) {
                        _drawBarrier(startX + (endX - startX) * process / 100)
                    }
                }
                process += nonlinear(process, set.speed)
            }, set.fps) 
        })
    }
    pq.push(removeMotion, _pos)
    pq.push(moveMotion, _pos)
}

/**
 * @desc 添加动画
 */
function _add(idx, num, _pos) {
    let moveMotion = () => {
        return new Promise((resolve, reject) => {
            let newGap = __updateGap(dta.length + 1) 
            let process = 0 
            barrier.splice(idx, 0, false) 
            emphasized.splice(idx, 0, false) 
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height) 
                    gap = newGap 
                    dta.splice(idx, 0, num) 
                    for (let i = 0; i < dta.length; i++) {
                        if (i === idx) continue
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height) 
                let oldIdx = 0 
                for (let i = 0; i < dta.length + 1; i++) {
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * oldIdx 
                    let endX = newGap + (set.blockSize + newGap) * i 
                    let startY = mid

                    _rect(dta[oldIdx], startX + (endX - startX) * process / 100, startY + (mid - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius, false, ctx, set)
                    oldIdx++ 
                    if (barrier[i]) {
                        _drawBarrier(startX + (endX - startX) * process / 100)
                    }
                }
                process += nonlinear(process, set.speed)
            }, set.fps) 
        })
    }
    let addMotion = () => {
        return new Promise((resolve, reject) => {
            let pos = gap + (gap + set.blockSize) * idx 
            ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth) 
            ctx.globalAlpha = 0
            let timer = setInterval(function () {
                if(pq.statusCheck(timer)) return
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
    用户接口
*/
/**
 * @desc 初始化函数
 */
function init(setting, information, element) {
    console.info("[AlgoMotion] Homepage: https://github.com/NicerWang/Algomotion")
    let dpr = window.devicePixelRatio
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
        speed: setting.speed ? setting.speed : 1.0,
        staticTime: setting.staticTime ? setting.staticTime / 10 : 80
    }
    if (setting.hidpi === false) {
        dpr = 1
    }
    dta = information.dta ? information.dta : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    mvs = information.mvs ? information.mvs : []
    barrier.length = dta.length
    emphasized.length = dta.length
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
    gap = __updateGap(dta.length)
    __show()
    if (setting.motion) {
        motion = true
        pq.pause(true)
        if (mr === null) {
            mr = __defaultMovesReader
        }
        mr(mvs, 0, true)
        pq.pause(false)
    }
}

/**
 * @desc 设置新的MovesReader以替代默认
 */
function setMovesReader(movesReader) {
    mr = movesReader 
}

/**
 * @desc 设置动画位置
 */
function setPosition(pos) {
    pq.stop()
    ctx.globalAlpha = 1
    barrier = kfs[pos].barrier.concat() 
    emphasized = kfs[pos].emphasized.concat() 
    dta = kfs[pos].dta.concat() 
    gap = __updateGap(dta.length)
    ctx.clearRect(0, 0, set.width, set.height)
    for (let i = 0; i < dta.length; i++) {
        _drawBlock(i)
    }
    setTimeout(() => {
        mr(mvs, pos)
    }, set.staticTime * 5)
}

/**
 * @desc 动画暂停与继续
 */
function pause(status) {
    pq.pause(status)
}

/**
 * @desc 析构函数
 */
function destroy() {
    pq.destroy()
    set = null
    ctx = null
    mr = null
    dta = null
    barrier = null
    emphasized = null
    mvs = []
    dta = [] 
    barrier = [] 
    emphasized = [] 
    kfs = [] 
}

/**
 * @desc 交换块
 */
function swapBlock(idx1, idx2, _pos = 0) {
    _swap(idx1, idx2, gap + (set.blockSize + gap) * idx1, mid, gap + (set.blockSize + gap) * idx2, mid, set.motionOffset, _pos) 
}

/**
 * @desc 重点显示块
 */
function emphasizeBlock(idx, status, _pos = 0) {
    let emphasizeMotion = () => {
        return new Promise((resolve, reject) => {
            let pos = gap + (gap + set.blockSize) * idx 
            ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth) 
            emphasized[idx] = status
            if (status) {
                _drawBlock(idx, true)
            } else {
                _drawBlock(idx, false)
            }
            _blank(pq, resolve, set.staticTime)
        })
    }
    pq.push(emphasizeMotion, _pos)
}

/**
 * @desc 添加分隔符
 */
function addBarrier(idxs, _pos = 0) {
    let barrierMotion = () => {
        return new Promise((resolve, reject) => {
            for(let i = 0; i < idxs.length; i++){
                barrier[idxs[i]] = true
                _drawBlock(idxs[i])
            }
            if(idxs.length === undefined){
                barrier[idxs] = true
                _drawBlock(idxs)
            }
            _blank(pq, resolve, set.staticTime)
        })
    }
    pq.push(barrierMotion, _pos)
}

/**
 * @desc 删除分隔符
 */
function removeBarrier(idxs, _pos = 0) {
    let barrierMotion = () => {
        return new Promise((resolve, reject) => {
            for(let i = 0; i < idxs.length; i++){
                barrier[idxs[i]] = false
            }
            if(idxs.length === undefined){
                barrier[idxs] = false
            }
            ctx.clearRect(0,0,set.width,set.height)
            for(let i = 0; i < dta.length; i++) {
                _drawBlock(i);
            }
            _blank(pq, resolve, set.staticTime)
        })
    }
    pq.push(barrierMotion, _pos)
}

/**
 * @desc 空白动作
 */
function addBlank(_pos = 0) {
    let blackMotion = () => {
        return new Promise((resolve, reject) => {
            _blank(pq, resolve, set.staticTime)
        })
    }
    pq.push(blackMotion, _pos)
}

/**
 * @desc 清空重点显示状态
 */
function clear(_pos = 0) {
    __show(_pos, true) 
}

/**
 * @desc 删除结点
 */
function removeBlock(idx, _pos = 0) {
    _remove(idx, _pos)
}

/**
 * @desc 新增结点
 */
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
    removeBarrier,
    addBlock,
    addBarrier
}