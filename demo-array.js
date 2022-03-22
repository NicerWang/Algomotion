import {
    addBarrier,
    addBlock,
    clear,
    destroy,
    emphasizeBlock,
    init,
    pause, removeBarrier,
    removeBlock,
    setPosition,
    swapBlock
} from "./type/array/index.js";

window.onload = () => {
    let canvas = document.getElementById("canvas")
    let position = {
        value:0
    }
    let preValue = 0;
    setInterval(()=>{
        if(position.value !== preValue){
            console.log(position.value)
            preValue = position.value
        }
    },200)
    let set = {
        hidpi: true,
        height: 250,
        width: 800,
        motion: true,
        position: [position]
    }
    let info = {
        'dta': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'mvs': ['get(0)', 'barrier(1,2,3)', 'get(1)', 'swap(0,1)', 'add(2,88)', 'remove(3)', 'swap(2,3)', 'unbarrier(1,2)', 'clear()', 'get(5)', 'swap(4,5)']
    }
    let element = document.querySelector("#selector")
    document.querySelector("#positions").innerHTML = info.mvs.join(",")

    for (let i = 0; i < info.mvs.length; i++) {
        element.options.add(new Option(info.mvs[i], i))
    }
    init(set, info, canvas);
    document.querySelector("#add").onclick = () => {
        addBlock(4, 88)
    }
    document.querySelector("#remove").onclick = () => {
        removeBlock(2)
    }
    document.querySelector("#clear").onclick = () => {
        clear()
    }
    document.querySelector("#swap").onclick = () => {
        swapBlock(0, 3)
    }
    document.status = false;
    document.querySelector("#emp").onclick = () => {
        document.status = !document.status
        emphasizeBlock(3, document.status);
        if (document.status) {
            document.querySelector("#emp").innerHTML = "unEmphasize(3th)"
        } else {
            document.querySelector("#emp").innerHTML = "Emphasize(3th)"

        }
    }
    document.querySelector("#barrier").onclick = () => {
        addBarrier([3,4]);
    }
    document.querySelector("#rbarrier").onclick = () => {
        removeBarrier(3)
    }
    document.querySelector("#ctl_c").onclick = () => {
        pause(false)
    }
    document.querySelector("#ctl_p").onclick = () => {
        pause(true)
    }
    document.querySelector("#setPosition").onclick = () => {
        let val = document.querySelector("#selector").value
        console.log(val)
        setPosition(val)
    }


}
window.onunload = () => {
    destroy();
}