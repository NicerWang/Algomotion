import {init, destroy, swapBlock, emphasizeBlock, clearEmphasize, removeBlock, addBlock} from "./type/array/index.js";
window.onload = () => {
    let canvas = document.getElementById("canvas")
    let set = {
        hidpi: true,
        height: 250,
        width: 800,
    }
    let info = {
        'dta': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        'mvs': []
    }
    init(set, info, canvas);
    document.querySelector("#add").onclick = ()=>{
        addBlock(3,11)
    }
    document.querySelector("#remove").onclick = ()=>{
        removeBlock(3)
    }
    document.querySelector("#clear").onclick = ()=>{
        clearEmphasize()
    }
    document.querySelector("#swap").onclick = ()=>{
        swapBlock(2,7)
    }
    window.status = false;
    document.querySelector("#emp").onclick = ()=>{
        emphasizeBlock(3,window.status);
        window.status = !window.status
    }

}
window.onunload = () => {
    destroy();
}