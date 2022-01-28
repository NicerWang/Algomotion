export class PromiseQueue {
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
        this.queue.push(f);
    }
    destroy() {
        clearInterval(this.interval);
    }
}
