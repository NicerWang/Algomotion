# AlgoMotion

用于算法可视化的轻量级Canvas绘制工具。

## Install

```
npm i algomotion
```

## Demo

[Click Here](https://nicerwang.github.io/Algomotion/demo.html)

![0.0.2](https://pictures-nicerwang-1256891306.cos.ap-beijing.myqcloud.com//img0.0.2.gif)

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
  | `fps`               | 动画帧率                     | 60      |
  | `speed`             | 动画执行速度                 | 1.0     |

* info

  | 名称  | 含义           |
  | ----- | -------------- |
  | `dta` | 放置数组数据。 |
  | `mvs` | 放置操作步骤。 |

#### 方法

| 名称                          | 作用                                                        |
| ----------------------------- | ----------------------------------------------------------- |
| `init(set,info,canvas)`       | 初始化函数。                                                |
| `destory()`                   | 析构函数。                                                  |
| `swapBlock(idx1,idx2)`        | 提供`index`，展示交换动画。                                 |
| `emphasizeBlock(idx,boolean)` | 提供`index`和一个布尔值，用于切换是否强调展示。             |
| `addBarrier(idx)`             | 提供`index`，在对应块之前放置分隔标记。                     |
| `clear()`                     | 清除所有的强调状态和标记。                                  |
| `addBlock(idx,num)`           | 添加一个新数字块。                                          |
| `removeBlock(idx)`            | 删除一个数字块。                                            |
| `pause(boolean)`              | 控制暂停继续动画。                                          |
| `setMovesReader(func)`        | 设定`mvs`处理器，处理器为一个函数，默认提供了一个可供参考。 |
| `setPosition(idx)`            | 控制关键帧的位置。                                          |

