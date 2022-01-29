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
        // clearInterval(this.timer);
        this.queue.length = 0;
        // this.timer = setInterval( async () => {
        //     if (this.queue.length > 0 && !this.lock) {
        //         this.lock = true;
        //         const f = this.queue.shift();
        //         await f();
        //         this.lock = false;
        //     }
        // }, this.interval);
    }
    pause(status){
        this.paused = status;
    }
}
