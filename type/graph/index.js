function matrixReader(labels,matrix) {
    let data = [];
    let edges = [];
    for(let i = 0; i < labels.length; i++){
        data.push({name:labels[i],id:i})
    }
    for(let i = 0; i < matrix.length; i++){
        for(let j = 0; j < matrix.length; j++){
            if(matrix[i][j] === 0) continue;
            edges.push({source:i,target:j});
        }
    }
    return [data,edges]
}
function emphasizeLink(idx1, idx2, edges, newWidth = 10, newColor = '#1c474d') {
    for(let i = 0; i < edges.length; i++){
        if(edges[i]['source'] === idx1 && edges[i]['target'] === idx2){
            edges[i]['lineStyle'] = {
                width:newWidth,
                color:newColor
            }
            break;
        }
    }
    return edges
}

function emphasizeNode(idx, data, newSize = 60, newColor = '#1c474d') {
    for(let i = 0; i < data.length; i++){
        if(data[i]['id'] === idx){
            data[i]['symbolSize'] = newSize;
            data[i]['color'] = newColor;
            break;
        }
    }
    return data
}

export {
    matrixReader,
    emphasizeLink,
    emphasizeNode
}