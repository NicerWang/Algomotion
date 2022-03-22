# AlgoMotion

用于算法可视化的轻量级Canvas绘制工具

## Install

```bash
npm i algomotion
```

## Demo

* Array(数组) [Here](https://nicerwang.github.io/Algomotion/demo-array.html)
* Tree(树结构) [Here](https://nicerwang.github.io/Algomotion/demo-tree.html)
* Graph(图) [Here](https://nicerwang.github.io/Algomotion/demo-graph.html)

## API

### General

#### 配置项

* Set

  | 名称                | 含义（涉及数字，单位均为px）                               | 默认值    |
  | ------------------- | ---------------------------------------------------------- | --------- |
  | `height`            | `Canvas`高度                                               | 250       |
  | `width`             | `Canvas`宽度                                               | 800       |
  | `blockMaxSize`      | 数字块(最大)边长(圆形直径)                                 | 50        |
  | `emphasisColor`     | 强调块背景色                                               | #bedce3   |
  | `emphasisTextColor` | 强调块字体颜色                                             | #1c474d   |
  | `textColor`         | 普通块字体颜色                                             | #eefcf5   |
  | `fillColor`         | 普通块背景色                                               | #14cdc8   |
  | `barrierColor`      | `Barrier`的颜色                                            | red       |
  | `font`              | 数字大小                                                   | 20        |
  | `hidpi`             | HiDPI支持                                                  | true      |
  | `fps`               | 动画帧率                                                   | 60        |
  | `speed`             | 动画执行速度                                               | 1.0       |
  | `motion`            | 是否使用`movesReader`读取`mvs`中的操作步骤                 | false     |
  | `postion`           | 启用`motion`时，绑定`mvs`执行的进度                        | undefined |
  | `staticTime`        | 定义一些静止动作的持续时间(如强调、空白动作等)(单位为浩渺) | 800       |

> `position`使用方法：
>
> * `Vue`
>
> ```vue
> let value = ref(0);
> let set = {
> 	position: [value]
> }
> ```
>
> * 普通`JS`请查看`Demo`源码，`postion`会在控制台打印。

* info

  | 名称  | 含义         |
  | ----- | ------------ |
  | `dta` | 放置数据     |
  | `mvs` | 放置操作步骤 |


#### 方法

| 名称                    | 作用                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `init(set,info,canvas)` | 初始化函数                                                   |
| `destory()`             | 析构函数                                                     |
| `pause(boolean)`        | 控制暂停继续动画                                             |
| `setMovesReader(func)`  | 设定`mvs`处理器，处理器为一个函数，默认详见：[默认MovesReader](#关于默认的MovesReader)。 |
| `setPosition(idx)`      | 控制关键帧的位置                                             |
| `clear()`               | 清除所有的强调状态和标记                                     |

### Array

#### 配置项

* set

  | 名称           | 含义（涉及数字，单位均为px） | 默认值 |
  | -------------- | ---------------------------- | ------ |
  | `maxGap`       | 块最大间隔                   | 25     |
  | `blockRadius`  | 块圆角半径                   | 5      |
  | `motionOffset` | 动画的上下偏移范围           | 50     |
  

#### 方法

| 名称                          | 作用                                                         |
| ----------------------------- | ------------------------------------------------------------ |
| `swapBlock(idx1,idx2)`        | 提供`index`，展示交换动画                                    |
| `emphasizeBlock(idx,boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示                |
| `addBarrier(arr)`             | 提供一个数组，数组内为`index`，用于在对应块之前放置分隔标记（兼容旧参数：仅一个数字） |
| `removeBarrier(arr)`          | 提供一个数组，数组内为`index`，用于在对应块之前删除分隔标记（兼容旧参数：仅一个数字） |
| `addBlock(idx,num)`           | 添加一个新数字块                                             |
| `removeBlock(idx)`            | 删除一个数字块                                               |

### Tree

#### 配置项

* Set

  | 名称                | 含义（涉及数字，单位均为px） | 默认值  |
  | ------------------- | ---------------------------- | ------- |
  | `maxLayerHeight`    | 树每一层的最大高度           | 70      |
  | `emphasisLineColor` | 强调连线颜色                 | #1c474d |

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

### Graph

基于较为原始的力引导布局的**无向图**。

#### 配置项

* Set

  | 名称                | 含义（涉及数字，单位均为px）         | 默认值  |
  | ------------------- | ------------------------------------ | ------- |
  | `blockSize`         | 每个结点的大小(替代原`blockMaxSize`) | 40      |
  | `emphasisLineColor` | 强调连线颜色                         | #1c474d |

* Info

  | 名称  | 含义                                 |
  | ----- | ------------------------------------ |
  | `rel` | 放置关系矩阵(二维)[建议仅填充上三角] |

#### 方法

| 名称                                 | 作用                                              |
| ------------------------------------ | ------------------------------------------------- |
| `emphasizeNode(idx,boolean)`         | 提供`index`和一个布尔值，用于切换是否强调展示结点 |
| `emphasizeLink(idx1, idx2, boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示边   |

## 关于默认的MovesReader

* `Array`

  支持的`mvs`格式(8种)：

  `get(index)`,`swap(index1,index2)`,`add(idx,number)`,`remove(index)`,`barrier(arr)`,`unbarrier(arr)`,`clear()`,`blank()`

  其中：

  * `get(index)`为高亮一次第`index`个元素
  * `barrier(arr)`在第`index`个元素前添加标记，即[`Demo`](#Demo)中的`AddBarrier`，可以传递多个参数作为`index`，如`barrier(1,2)`
  * `unbarrier(arr)`用法同上，但是用以删除标记
  * `clear()`为清除所有`barrier`标记
  * `blank()`为什么都不做，等待一次，用于配合其他动作
* `Tree`

  支持的`mvs`格式(5种)：

  `get(index)`,`swap(index1,index2)`,`insert(index,number)`,`remove(index)`,`blank()`

  其中：

  * `index`为结点在完全二叉树中的位置
  * `blank()`为什么都不做，等待一次，用于配合其他动作

* `Graph`

  支持的`mvs`格式(6种)：

  `emp(index)`,`unemp(index)`,`link(index1,index2)`,`unlink(index1,index2)`,`clear()`,`blank()`

  其中：

  * `emp/unemp`为切换结点的强调展示状态
  * `link/unlink`为切换边的强调展示状态

  * `blank()`为什么都不做，等待一次，用于配合其他动作
