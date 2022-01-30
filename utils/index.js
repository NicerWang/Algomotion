export class PromiseQueue {
    paused = false;
    stopped = false;
    lock = false;
    interval = 100;
    timer = null;
    queue = [];
    constructor(interval) {
        this.interval = interval;
        this.lock = false;
        this.interval = 100;
        this.timer = setInterval( async () => {
            if (this.queue.length > 0 && !this.lock) {
                this.lock = true;
                const f = this.queue.shift();
                await f();
                this.lock = false;
            }
        }, this.interval);
    }
    push(f) {
        this.stopped = false;
        this.queue.push(f);
    }
    destroy() {
        this.stopped = true;
        clearInterval(this.timer);
    }
    stop(){
        this.stopped = true;
        this.queue.length = 0;
    }
    pause(status){
        this.paused = status;
    }
}
export function __drawRect(x, y, w, h, r, ctx) {
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

export function __fillNumber(num, font, x, y, w, h, ctx) {
    let startX = x + w / 2;
    let startY = y + h / 2;
    ctx.font = font + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), startX, startY);
}