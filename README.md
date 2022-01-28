# AlgoMotion

用于算法可视化的轻量级Canvas绘制工具。

## Install

```
npm i algomotion
```

## Demo

[Click Here](https://nicerwang.github.io/Algomotion/demo.html)

![0.0.2](https://pictures-nicerwang-1256891306.cos.ap-beijing.myqcloud.com//img0.0.2.gif)

* For Vue3

```vue
<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
  <button @click="swapBlock(2,7)">Swap</button>
  <button @click="emphasizeBlock(3,status);status = !status">Emp</button>
  <button @click="clearEmphasize">Clear</button>
  <button @click="removeBlock(3)">Remove</button>
  <button @click="addBlock(3,11)">Add</button>
</template>

<script>
import {onMounted, onUnmounted, ref} from "vue";
import {init, destroy, swapBlock, emphasizeBlock, clearEmphasize, removeBlock, addBlock} from "./algomotion/type/array";

export default {
  name: 'AlgoMotion_Test',
  setup(){
    let canvas = ref(null)
    let set = {
      hidpi:true,
      height:250,
      width:800,
    }
    let info = {
      'dta':[0,1,2,3,4,5,6,7,8,9,10,11,12],
      'mvs':[]
    }
    let status = ref(true)

    onMounted(()=>{
      init(set,info,canvas.value);
    })

    onUnmounted(()=>{
      destroy();
    })
    return {
      canvas,
      swapBlock,
      emphasizeBlock,
      clearEmphasize,
      removeBlock,
      addBlock,
      status,
    }
  }
}
</script>
```

## API

### Array

### 配置项

* set

  | 名称                | 含义（涉及数字，单位均为px） | 默认值  |
  | ------------------- | ---------------------------- | ------- |
  | `height`            | `Canvas`高度                 | 250     |
  | `width`             | `Canvas`宽度                 | 800     |
  | `blockMaxSize`      | 数字块最大边长               | 50      |
  | `maxGap`            | 块最大间隔                   | 25      |
  | `blockRadius`       | 块圆角半径                   | 5       |
  | `emphasisColor`     | 强调块背景色                 | #bedce3 |
  | `emphasisTextColor` | 强调块字体颜色               | #1c474d |
  | `textColor`         | 普通块字体颜色               | #eefcf5 |
  | `fillColor`         | 普通块背景色                 | #14cdc8 |
  | `motionOffset`      | 动画的偏移范围               | 50      |
  | `font`              | 数字大小                     | 20      |
  | `hidpi`             | HiDPI支持                    | true    |

* info

  | 名称  | 含义                     |
  | ----- | ------------------------ |
  | `dta` | 放置数组数据。           |
  | `mvs` | 放置操作步骤。(暂未使用) |

#### 方法

| 名称                          | 作用                                            |
| ----------------------------- | ----------------------------------------------- |
| `init(set,info,canvas)`       | 初始化函数。                                    |
| `destory()`                   | 析构函数。                                      |
| `swapBlock(idx1,idx2)`        | 提供`index`，展示交换动画。                     |
| `emphasizeBlock(idx,boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示。 |
| `clearEmphasize()`            | 清除所有的强调展示状态。                        |
| `addBlock(idx,num)`           | 添加一个新数字块。                              |
| `removeBlock(idx)`            | 删除一个数字块。                                |

