export class PromiseQueue {
    paused = false;
    stopped = false;
    motion = false;
    lock = false;
    interval = 100;
    timer = null;
    queue = [];
    indexQueue = [];
    constructor(motion, position) {
        this.motion = motion;
        this.position = position;
        this.lock = false;
        this.interval = 100;
        this.timer = setInterval( async () => {
            if (this.queue.length > 0 && !this.lock) {
                this.lock = true;
                const f = this.queue.shift();
                if(this.motion){
                    this.position[0].value = this.indexQueue.shift();
                }
                await f();
                this.lock = false;
            }
        }, this.interval);
    }
    push(f,idx) {
        this.stopped = false;
        this.queue.push(f);
        if(this.motion) {
            this.indexQueue.push(idx);
        }
    }
    destroy() {
        this.stopped = true;
        this.queue.length = 0;
        this.indexQueue.length = 0;
        clearInterval(this.timer);
    }
    stop(){
        this.stopped = true;
        this.queue.length = 0;
        this.indexQueue.length = 0;
    }
    pause(status){
        this.paused = status;
    }
    statusCheck(timer){
        if (this.stopped) {
            this.lock = false
            clearInterval(timer)
            return true
        }
        if (this.paused) return true
    }
}
function __drawRect(x, y, w, h, r, ctx) {
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

function __fillNumber(num, font, x, y, w, h, ctx) {
    let startX = x + w / 2;
    let startY = y + h / 2;
    ctx.font = font + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), startX, startY);
}

export function _line(fromX, fromY, toX, toY, isEmphasized, ctx, set) {
    let temp = ctx.lineWidth;
    ctx.lineWidth = 10
    ctx.strokeStyle = set.fillColor;
    if (isEmphasized) {
        ctx.lineWidth = 15
        ctx.strokeStyle = set.emphasisLineColor
    }
    ctx.beginPath();
    ctx.moveTo(fromX + set.blockSize / 2, fromY + set.blockSize / 2);
    ctx.lineTo(toX + set.blockSize / 2, toY + set.blockSize / 2);
    ctx.stroke();
    ctx.lineWidth = temp;
}

export function _rect(num, x, y, w, h, r, isEmphasized, ctx, set) {
    if(isEmphasized){
        ctx.fillStyle = set.emphasisColor
    }
    else{
        ctx.fillStyle = set.fillColor;
    }
    __drawRect(x, y, w, h, r, ctx);
    if(isEmphasized){
        ctx.fillStyle = set.emphasisTextColor
    }
    else{
        ctx.fillStyle = set.textColor;
    }
    __fillNumber(num, set.font, x, y, w, h, ctx);
}

export function _blank(pq, resolve, staticTime) {
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
    }, staticTime)
}