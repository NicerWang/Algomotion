import {
    clear,
    destroy,
    emphasizeNode,
    emphasizeLink,
    init,
    pause,
    setPosition,
} from "./type/graph/index.js";

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
        'dta': [0, 1, 2, 3, 4],
        'rel': [[0, 1, 1, 1, 1],[0, 0, 1, 1, 1],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]],
        'mvs':['emp(0)','emp(1)','link(0,1)','link(1,2)','unemp(1)','unlink(1,2)','unlink(0,1)']
    }
    let element = document.querySelector("#selector")
    document.querySelector("#positions").innerHTML = info.mvs.join(",")

    for (let i = 0; i < info.mvs.length; i++) {
        element.options.add(new Option(info.mvs[i], i))
    }
    init(set, info, canvas);
    document.querySelector("#clear").onclick = () => {
        clear()
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
    document.status_link = false;
    document.querySelector("#link").onclick = () => {
        document.status_link = !document.status_link
        emphasizeLink(0,2, document.status_link);
        if(document.status_link){
            document.querySelector("#link").innerHTML = "unLink(0th,2th)"
        }
        else{
            document.querySelector("#link").innerHTML = "Link(0th,2th)"

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