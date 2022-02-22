import {
    addNode,
    clear,
    destroy,
    emphasizeNode,
    init,
    pause,
    removeNode,
    setPosition,
    swapNode
} from "./type/tree/index.js";

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
        'dta': [0, 1, 2, 3, 4, 5, 6, 7, undefined, 9, 10, 11, 12],
        'mvs':['get(0)','get(1)','swap(0,1)','insert(8,88)','remove(10)','insert(15,88)','remove(15)']
    }
    let element = document.querySelector("#selector")
    document.querySelector("#positions").innerHTML = info.mvs.join(",")

    for (let i = 0; i < info.mvs.length; i++) {
        element.options.add(new Option(info.mvs[i], i))
    }
    init(set, info, canvas);
    document.querySelector("#add").onclick = () => {
        addNode(8, 88)
    }
    document.querySelector("#remove").onclick = () => {
        removeNode(8)
    }
    document.querySelector("#clear").onclick = () => {
        clear()
    }
    document.querySelector("#swap").onclick = () => {
        swapNode(0, 1)
    }
    document.status = false;
    document.querySelector("#emp").onclick = () => {
        document.status = !document.status
        emphasizeNode(3, document.status);
        if(document.status){
            document.querySelector("#emp").innerHTML = "unEmphasize(3th)"
        }
        else{
            document.querySelector("#emp").innerHTML = "Emphasize(3th)"

        }
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