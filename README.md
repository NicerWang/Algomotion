# AlgoMotion

用于算法可视化的轻量级Canvas绘制工具

## Install

```bash
npm i algomotion
```

## Demo

* Array(数组) [Here](https://nicerwang.github.io/Algomotion/demo-array.html)
* Tree(树结构) [Here](https://nicerwang.github.io/Algomotion/demo-tree.html)
* Graph(图)(可选) 基于`Echarts`,暂无Demo.

## API

### General

#### 配置项

* Set

  | 名称                | 含义（涉及数字，单位均为px）               | 默认值    |
  | ------------------- | ------------------------------------------ | --------- |
  | `height`            | `Canvas`高度                               | 250       |
  | `width`             | `Canvas`宽度                               | 800       |
  | `blockMaxSize`      | 数字块最大边长(圆形直径)                   | 50        |
  | `emphasisColor`     | 强调块背景色                               | #bedce3   |
  | `emphasisTextColor` | 强调块字体颜色                             | #1c474d   |
  | `textColor`         | 普通块字体颜色                             | #eefcf5   |
  | `fillColor`         | 普通块背景色                               | #14cdc8   |
  | `font`              | 数字大小                                   | 20        |
  | `hidpi`             | HiDPI支持                                  | true      |
  | `fps`               | 动画帧率                                   | 60        |
  | `speed`             | 动画执行速度                               | 1.0       |
  | `motion`            | 是否使用`movesReader`读取`mvs`中的操作步骤 | false     |
  | `postion`           | 启用`motion`时，绑定`mvs`执行的进度        | undefined |

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

### Graph(Optional)

碍于时间和技术所限，为达到较好效果，基于`Echarts`实现，仅需要使用图时才需引入`Echarts`依赖，使用数组和树时无需引入。

* 推荐`Option`

  ```javascript
  option = {
    series: [
      {
      type: 'graph',
      layout: 'force',
      animation: false,
      silent: true,
      color: '#14cdc8',
      label: {
      show: true,
      color: '#eefcf5',
      fontSize: 20
      },
      lineStyle: {
      color: '#14cdc8',
      width: 5,
      opacity: 1
      },
      force: {
      repulsion: 200,
      edgeLength: 100
      },
      symbolSize: 40,
      data: data,
      edges: edges
      }
    ]
  };
  ```

* 提供的辅助函数

  | 名称                                                         | 作用                                                         |
  | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | `matrixReader(labels,matrix)`                                | 提供每个结点的标签和邻接矩阵，返回`Option`中的`data`和`edges` |
  | `emphasizeLink(idx1, idx2, edges, newWidth = 10, newColor = '#1c474d') ` | 突出显示边，返回新`edges`                                    |
  | `emphasizeNode(idx, data, newSize = 60, newColor = '#1c474d') ` | 突出显示结点，返回新`data`                                   |

  
