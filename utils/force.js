export function force(data, edges, width, height, blockSize) {
    let finalPosition = randomPosition(data.length, width, height)
    let child = new Array(data.length).fill(0)
    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data.length; j++){
            if(edges[i * data.length + j] !== 0){
                child[i]++;
                child[j]++;
            }
        }
    }
    const maxInterval = 300; // 平衡位置间距
    const maxOffset = 10; // 最大变化位移
    const minOffset = 0; // 最小变化位移
    const count = 100; // force次数
    const attenuation = 50; // 力衰减
    const iterate = () => {
        for(let i = 0; i < data.length; i++){
            let [x1, y1] = finalPosition[i]
            for(let j = 0; j < data.length; j++){
                if(i === j) continue
                let [x2, y2] = finalPosition[j]
                let dis = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
                let forceOffset = 0;
                let x3, y3;
                if (dis > maxInterval) {
                    forceOffset = (dis - maxInterval) / attenuation;
                    forceOffset = forceOffset > maxOffset ? maxOffset : forceOffset;
                    forceOffset = forceOffset < minOffset ? minOffset : forceOffset;
                    forceOffset += child[j] / attenuation;
                    let k = forceOffset / dis;
                    x3 = k * (x1 - x2) + x2;
                    y3 = k * (y1 - y2) + y2;
                } else if (dis < maxInterval && dis > 0) {
                    forceOffset = (maxInterval - dis) / attenuation;
                    forceOffset = forceOffset > maxOffset ? maxOffset : forceOffset;
                    forceOffset = forceOffset < minOffset ? minOffset : forceOffset;
                    forceOffset += child[j] / attenuation;
                    let k = forceOffset / (dis + forceOffset);
                    x3 = (k * x1 - x2) / (k - 1);
                    y3 = (k * y1 - y2) / (k - 1);
                } else {
                    x3 = x2;
                    y3 = y2;
                }
                x3 > width - blockSize ? x3 -= blockSize : null;
                x3 < blockSize ? x3 += blockSize : null;
                y3 > height - blockSize ? y3 -= blockSize : null;
                y3 < blockSize ? y3 += blockSize : null;
                finalPosition[j] = [x3, y3];
            }
        }
    }
    for(let i = 0; i < count; i++){
        iterate()
    }
    return finalPosition
}

function getRandom(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

function randomPosition(len, width, height) {
    let ret = []
    for(let i = 0; i < len; i++){
        ret.push([getRandom(0, width), getRandom(0, height)])
    }
    return ret;
}