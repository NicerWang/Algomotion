# AlgoMotion

用于算法可视化的轻量级Canvas绘制工具

## Install

```bash
npm i algomotion
```

## Demo

* Array(数组) [Click Here](https://nicerwang.github.io/Algomotion/demo-array.html)

* Tree(树结构) [Click Here](https://nicerwang.github.io/Algomotion/demo-tree.html)

## API

### General

#### 配置项

* Set

  | 名称                | 含义（涉及数字，单位均为px） | 默认值  |
  | ------------------- | ---------------------------- | ------- |
  | `height`            | `Canvas`高度                 | 250     |
  | `width`             | `Canvas`宽度                 | 800     |
  | `blockMaxSize`      | 数字块最大边长(圆形直径)     | 50      |
  | `emphasisColor`     | 强调块背景色                 | #bedce3 |
  | `emphasisTextColor` | 强调块字体颜色               | #1c474d |
  | `textColor`         | 普通块字体颜色               | #eefcf5 |
  | `fillColor`         | 普通块背景色                 | #14cdc8 |
  | `font`              | 数字大小                     | 20      |
  | `hidpi`             | HiDPI支持                    | true    |
  | `fps`               | 动画帧率                     | 60      |
  | `speed`             | 动画执行速度                 | 1.0     |

* info

  | 名称  | 含义         |
  | ----- | ------------ |
  | `dta` | 放置数据     |
  | `mvs` | 放置操作步骤 |


#### 方法

| 名称                    | 作用                                                      |
| ----------------------- | --------------------------------------------------------- |
| `init(set,info,canvas)` | 初始化函数                                                |
| `destory()`             | 析构函数                                                  |
| `pause(boolean)`        | 控制暂停继续动画                                          |
| `setMovesReader(func)`  | 设定`mvs`处理器，处理器为一个函数，默认提供了一个可供参考 |
| `setPosition(idx)`      | 控制关键帧的位置                                          |
| `clear()`               | 清除所有的强调状态和标记                                  |

### Array

#### 配置项

* set

  | 名称           | 含义（涉及数字，单位均为px） | 默认值 |
  | -------------- | ---------------------------- | ------ |
  | `maxGap`       | 块最大间隔                   | 25     |
  | `blockRadius`  | 块圆角半径                   | 5      |
  | `motionOffset` | 动画的上下偏移范围           | 50     |
  

#### 方法

| 名称                          | 作用                                          |
| ----------------------------- | --------------------------------------------- |
| `swapBlock(idx1,idx2)`        | 提供`index`，展示交换动画                     |
| `emphasizeBlock(idx,boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示 |
| `addBarrier(idx)`             | 提供`index`，在对应块之前放置分隔标记         |
| `addBlock(idx,num)`           | 添加一个新数字块                              |
| `removeBlock(idx)`            | 删除一个数字块                                |

### Tree

#### 配置项

* Set

  | 名称             | 含义（涉及数字，单位均为px） | 默认值 |
  | ---------------- | ---------------------------- | ------ |
  | `maxLayerHeight` | 树每一层的最大高度           | 70     |

  > 另外，树枝的颜色为`fillColor`，交换(`swap`)时会变为`emphasisTextColor`。

* Info

  树结点的索引，是其在完美二叉树中的位置，从0开始。

#### 方法

| 名称                         | 作用                                          |
| ---------------------------- | --------------------------------------------- |
| `swapNode(idx1,idx2)`        | 提供`index`，展示交换动画                     |
| `emphasizeNode(idx,boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示 |
| `addNode(idx,num)`           | 添加一个新结点                                |
| `removeNode(idx)`            | 删除一个结点                                  |

