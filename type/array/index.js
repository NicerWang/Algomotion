import {threeBezier} from '../../bezier';
import {nonlinear} from "../../motion";

let set;
let info = {
    'dta':[1,2,3,4,5,6,7,8,9],
    'mvs':[]
}
let ctx;

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
    element.setAttribute('width', set.width);
    element.setAttribute('height', set.height);
    element.setAttribute('style',"width:" + set.width / dpr + "px;height:" + set.height / dpr + "px");
    ctx = element.getContext('2d');
    if (!ctx){
        alert("Your browser does not support canvas!")
        return
    }
    if (info.dta.length * (set.blockSize + 4) > set.width) {
        console.error("Block size will be modified to fit screen.")
        set.blockSize = Math.floor(set.width / info.dta.length) - 4
    }
    gap = Math.min((set.width - info.dta.length * set.blockSize) / (info.dta.length + 2), set.maxGap)
    mid = (set.height - set.blockSize) / 2
    ctx.globalAlpha = 0;
    let timer = setInterval(function () {
        ctx.clearRect(0,0,set.width,set.height)
        for(let i = 0; i < info.dta.length; i++) {
            _drawBlock(i)
        }
        ctx.globalAlpha += 0.05
        if(ctx.globalAlpha > 0.9){
            ctx.globalAlpha = 1
            for(let i = 0; i < info.dta.length; i++)
                _drawBlock(i)
            clearInterval(timer)
        }
    },1000/60)
}

// Draw Rectangular
function _drawRect(x, y, w, h, r) {
    ctx.clearRect(x, y, w, h);
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
function _fillNumber(num, font, x, y, w, h) {
    let startX = x + w / 2;
    let startY = y + h / 2;

    ctx.font = font + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), startX, startY);
}

// Emphasize Rectangular
function _emphasizeRect(num, x, y, w, h, r) {
    ctx.fillStyle = set.emphasisColor;
    _drawRect(x, y, w, h, r);
    ctx.fillStyle = set.emphasisTextColor;
    _fillNumber(num, set.font + 5, x, y, w, h);
}

// Swap Blocks
function _swap(idx1, idx2, p1x, p1y, p2x, p2y, offset) {
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
}

// Draw Blocks
function _drawBlock (idx) {
    ctx.fillStyle = set.fillColor;
    let pos = gap + (gap + set.blockSize) * idx;
    _drawRect(pos, mid, set.blockSize, set.blockSize, set.blockRadius, ctx);
    ctx.fillStyle = set.textColor;
    _fillNumber(info.dta[idx], set.font, pos, mid, set.blockSize, set.blockSize, ctx);
}

function swapBlock (idx1, idx2) {
    _swap(idx1, idx2, gap + (set.blockSize + gap) * idx1, mid, gap + (set.blockSize + gap) * idx2, mid, set.motionOffset);
}

function emphasizeBlock(idx, status) {
    let pos = gap + (gap + set.blockSize) * idx;
    ctx.clearRect(pos - ctx.lineWidth, mid - ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth, set.blockSize + 2 * ctx.lineWidth);
    if (status){
        _emphasizeRect(info.dta[idx], pos, mid, set.blockSize, set.blockSize, set.blockRadius)
    }
    else{
        _drawBlock(idx)
    }
}

function clearEmphasize() {
    ctx.globalAlpha = 0;
    let timer = setInterval(function () {
        for(let i = 0; i < info.dta.length; i++)
            _drawBlock(i)
        ctx.globalAlpha += 0.05
        if(ctx.globalAlpha > 0.9){
            ctx.globalAlpha = 1
            clearInterval(timer)
        }
    },1000/60)
}

export {
    init,
    swapBlock,
    emphasizeBlock,
    clearEmphasize
}