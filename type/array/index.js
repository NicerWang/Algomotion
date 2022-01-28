import {threeBezier} from '../../bezier/index.js';
import {nonlinear} from "../../motion/index.js";
import {PromiseQueue} from "../../utils/index.js";

let set;
let info;
let ctx;
let pq;

let gap;
let mid;

// Initialize
function init(setting, information, element) {
    let dpr = window.devicePixelRatio;
    if(setting.hidpi === false){
        dpr = 1;
    }
    set = {
        height:setting.height?setting.height * dpr: 250 * dpr,
        width:setting.width?setting.width * dpr: 800 * dpr,
        blockMaxSize:setting.blockSize?setting.blockSize * dpr: 50 * dpr,
        blockSize:setting.blockSize?setting.blockSize * dpr: 50 * dpr,
        maxGap:setting.maxGap?setting.maxGap * dpr: 25 * dpr,
        blockRadius:setting.blockRadius?setting.blockRadius*dpr: 5 * dpr,
        emphasisColor:setting.emphasisColor?setting.emphasisColor: '#bedce3',
        emphasisTextColor:setting.emphasisTextColor?setting.emphasisTextColor: '#1c474d',
        textColor:setting.textColor?setting.textColor: '#eefcf5',
        fillColor:setting.fillColor?setting.fillColor: '#14cdc8',
        motionOffset:setting.motionOffset?setting.motionOffset*dpr: 50 * dpr,
        font:setting.font?setting.font*dpr: 20 * dpr
    };
    info = {
        dta:information.dta?information.dta:[0,1,2,3,4,5,6,7,8,9],
        mvs:information.mvs?information.mvs:[]
    };
    mid = (set.height - set.blockSize) / 2
    element.setAttribute('width', set.width);
    element.setAttribute('height', set.height);
    element.setAttribute('style',"width:" + set.width / dpr + "px;height:" + set.height / dpr + "px");
    ctx = element.getContext('2d');
    pq = new PromiseQueue();
    if (!ctx){
        alert("[Error]Your browser does not support canvas!")
        return
    }
    gap = __updateGap(info.dta.length)
    __show()
}

// Destroy
function destroy() {
    set.clear();
    info.clear();
    pq.destroy();
}

// Show all blocks
function __show() {
    ctx.globalAlpha = 0;
    let timer = setInterval(function () {
        ctx.clearRect(0,0,set.width,set.height)
        for(let i = 0; i < info.dta.length; i++) {
            _drawBlock(i)
        }
        ctx.globalAlpha += 0.025
        if(ctx.globalAlpha > 0.9){
            ctx.globalAlpha = 1
            for(let i = 0; i < info.dta.length; i++)
                _drawBlock(i)
            clearInterval(timer)
        }
    },1000/60)
}

// Parameter updater
function __updateGap(length) {
    if (length * (set.blockSize + 4) > set.width) {
        console.info("Block size will be modified to fit screen.")
        set.blockSize = Math.floor(set.width / length) - 4
    }
    if (length * (set.blockSize + 4) < set.width && length * (set.blockMaxSize + 4) < set.width) {
        console.info("Block size will be modified to fit screen.")
        set.blockSize = set.blockMaxSize
    }
    return Math.min((set.width - length * set.blockSize) / (length + 2), set.maxGap)
}

// Draw Rectangular
function __drawRect(x, y, w, h, r) {
    ctx.clearRect(x - ctx.lineWidth, y - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    let path = new Path2D();
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.arc(x + w - r, y + r, r, Math.PI / 180 * 270, 0, false);
    path.lineTo(x + w, y + h - r);
    path.arc(x + w - r, y + h - r, r, 0, Math.PI / 180 * 90, false);
    path.lineTo(x + r, y + h);
    path.arc(x + r, y + h - r, r, Math.PI / 180 * 90, Math.PI / 180 * 180, false);
    path.lineTo(x, y + r);
    path.arc(x + r, y + r, r, Math.PI / 180 * 180, Math.PI / 180 * 270, false);
    ctx.fill(path);
}

// Fill Number in Rectangular
function __fillNumber(num, font, x, y, w, h) {
    let startX = x + w / 2;
    let startY = y + h / 2;
    ctx.font = font + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), startX, startY);
}

// Rectangular
function _rect(num, x, y, w, h, r) {
    ctx.fillStyle = set.fillColor;
    __drawRect(x, y, w, h, r);
    ctx.fillStyle = set.textColor;
    __fillNumber(num, set.font, x, y, w, h);
}

// Emphasize Rectangular
function _emphasizeRect(num, x, y, w, h, r) {
    ctx.fillStyle = set.emphasisColor;
    __drawRect(x, y, w, h, r);
    ctx.fillStyle = set.emphasisTextColor;
    __fillNumber(num, set.font + 5, x, y, w, h);
}

// Draw Blocks
function _drawBlock (idx, isEmphasized = false) {
    let pos = gap + (gap + set.blockSize) * idx;
    if(!isEmphasized){
        _rect(info.dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius)
    }
    else{
        _emphasizeRect(info.dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius)
    }
}

// Swap Blocks
function _swap(idx1, idx2, p1x, p1y, p2x, p2y, offset) {
    let swapMotion = ()=>{
        return new Promise((resolve, reject)=>{
            let changedX = Math.min(p1x, p2x) - ctx.lineWidth;
            let changedY = Math.min(p1y, p2y) - ctx.lineWidth - offset;
            let changedWidth = ctx.lineWidth * 2 + set.blockSize + Math.max(p2x - p1x, p1x - p2x);
            let changedHeight = ctx.lineWidth + Math.abs(offset) * 2 + set.blockSize + Math.max(p2y - p1y, p1y - p2y);
            let process = 0;
            let x1 = p1x;
            let y1 = p1y;
            let x2 = p2x;
            let y2 = p2y;
            let timer = setInterval(function () {
                if (process > 100) {
                    let t = info.dta[idx1];
                    info.dta[idx1] = info.dta[idx2];
                    info.dta[idx2] = t;
                    ctx.clearRect(changedX, changedY, changedWidth, changedHeight);
                    for (let i = idx1; i <= idx2; i++) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(changedX, changedY, changedWidth, changedHeight);
                [x1, y1] = threeBezier(process / 100, [p1x, p1y], [p1x, p1y + offset], [p2x, p2y + offset], [p2x, p2y]);
                [x2, y2] = threeBezier(process / 100, [p2x, p2y], [p2x, p2y - offset], [p1x, p1y - offset], [p1x, p1y]);
                _emphasizeRect(info.dta[idx1],x1, y1, set.blockSize, set.blockSize, set.blockRadius)
                _emphasizeRect(info.dta[idx2],x2, y2, set.blockSize, set.blockSize, set.blockRadius)
                for (let i = idx1 + 1; i < idx2; i++) {
                    _drawBlock(i)
                }
                process += nonlinear(process)
            }, 1000 / 60);
        })
    }
    pq.push(swapMotion)
}

// Remove Blocks
function _removeBlock(idx) {
    let removeMotion = ()=>{
        return new Promise((resolve, reject)=>{
            let timer = setInterval(function () {
                _drawBlock(idx)
                ctx.globalAlpha -= 0.025
                if(ctx.globalAlpha < 0.1){
                    ctx.globalAlpha = 0
                    _drawBlock(idx)
                    clearInterval(timer)
                    ctx.globalAlpha = 1
                    resolve()
                    return
                }
            },1000/60)
        });
    }
    let moveMotion = ()=>{
        return new Promise((resolve, reject)=>{
            console.log(info.dta)
            let newGap = __updateGap(info.dta.length - 1);
            let process = 0;
            let timer = setInterval(function () {
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height);
                    gap = newGap;
                    info.dta.splice(idx,1);
                    console.log(info.dta)
                    for (let i = 0; i < info.dta.length; i++) {
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height);
                let newIdx = 0;
                for(let i = 0; i < info.dta.length; i++){
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * i;
                    let endX = newGap + (set.blockSize + newGap) * newIdx;
                    let startY = mid;
                    let endY = mid;
                    newIdx++;
                    _rect(info.dta[i],startX + (endX - startX) * process / 100, startY + (endY - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius)
                }
                process += nonlinear(process)
            }, 1000 / 60);
        })
    }
    pq.push(removeMotion)
    pq.push(moveMotion)
}

// Add Blocks
function _addBlock(idx, num) {
    let moveMotion = ()=>{
        return new Promise((resolve, reject)=>{
            let newGap = __updateGap(info.dta.length + 1);
            let process = 0;
            let timer = setInterval(function () {
                if (process > 100) {
                    ctx.clearRect(0, 0, set.width, set.height);
                    gap = newGap;
                    info.dta.splice(idx,0,num);
                    for (let i = 0; i < info.dta.length; i++) {
                        if (i === idx) continue
                        _drawBlock(i)
                    }
                    clearInterval(timer)
                    resolve()
                    return
                }
                ctx.clearRect(0, 0, set.width, set.height);
                let oldIdx = 0;
                for(let i = 0; i < info.dta.length + 1; i++){
                    if (i === idx) continue
                    let startX = gap + (set.blockSize + gap) * oldIdx;
                    let endX = newGap + (set.blockSize + newGap) * i;
                    let startY = mid;
                    let endY = mid;
                    _rect(info.dta[oldIdx],startX + (endX - startX) * process / 100, startY + (endY - startY) * process / 100, set.blockSize, set.blockSize, set.blockRadius)
                    oldIdx++;
                }
                process += nonlinear(process)
            }, 1000 / 60);
        })
    }
    let addMotion = ()=>{
        return new Promise((resolve, reject)=>{
            let pos = gap + (gap + set.blockSize) * idx;
            ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
            ctx.globalAlpha = 0
            let timer = setInterval(function () {
                _drawBlock(idx)
                ctx.globalAlpha += 0.025
                if(ctx.globalAlpha > 0.9){
                    ctx.globalAlpha = 1
                    _drawBlock(idx)
                    clearInterval(timer)
                    resolve()
                    return
                }
            },1000/60)
        })
    }
    pq.push(moveMotion)
    pq.push(addMotion)
}

// INTERFACE
function swapBlock (idx1, idx2) {
    _swap(idx1, idx2, gap + (set.blockSize + gap) * idx1, mid, gap + (set.blockSize + gap) * idx2, mid, set.motionOffset);
}

// INTERFACE
function emphasizeBlock(idx, status) {
    let pos = gap + (gap + set.blockSize) * idx;
    ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    if (status){
        _drawBlock(idx,true)
    }
    else{
        _drawBlock(idx,false)
    }
}

// INTERFACE
function clearEmphasize() {
    __show();
}

// INTERFACE
function removeBlock(idx) {
    _removeBlock(idx)
}

// INTERFACE
function addBlock(idx, num) {
    _addBlock(idx,num)
}

export {
    init,
    destroy,
    swapBlock,
    emphasizeBlock,
    clearEmphasize,
    removeBlock,
    addBlock
}