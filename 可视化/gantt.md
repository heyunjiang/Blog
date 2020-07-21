# 甘特图架构设计

time: 2020.7.20  
author: heyunjiang

## 1 背景

需求  
1. 项目需要：业务和公共设施都需要甘特图组件
2. 可视化发展：甘特图作为可视化关键图标，在常用B端业务都会有涉及

现状  
1. frappe-gantt: github star 1.8k+，基于 svg。开源首选，满足常用甘特图功能，支持头部、表体自定义。在渲染大量数据时，有一定性能问题，作为业务备选方案
2. echarts-gantt: echarts 有简单的 gantt 组件示例，和业务需求差距甚远，需要自己使用自定义系列来实现功能，基于 echarts 扩展难度较大，可能会有意想不到的问题
3. tapd 甘特图：成熟系统 tapd，甘特图实现为：无限滚动table + canvas 实现
4. teambition 甘特图：无限滚动 div + svg 实现

其他暂无可以参考实现

## 2 甘特图特点

1. 左侧 table，右侧 gantt，并且要求数据匹配，滚动联动
2. 甘特图表头日期自定义
3. 表体：基本竖线、周末深色、今日高亮、鼠标悬浮高亮
4. 元素：基本长条、拖拽改变长度与时间、前置关系及连接线、悬浮提示框

## 3 调研分析

1. echarts 无计划支持甘特图，放弃
2. hightcharts 等其他图表库，对于 gantt 支撑也不友好

解决方案：
1. svg: 基于 frappe-gantt 继续扩展，优化以前方案
2. canvas: 基于 zrender 绘制甘特图，参考 frappe-gantt 实现一套 canvas 的

最终选择方案2，原因  
1. frappe-gantt 基于 svg，对于多数据性能要求来说，还是 canvas 性能好，重写成本不高
2. frappe-gantt 源码不多，代码量 1k+，可重新实现一版，深入理解内部原理，方便解决所有问题，扩展、优化代码，增加可读性

## 4 详细设计

project: frappe-gantt-canvas  
author: heyunjiang

### 4.1 代码架构设计

1. 复用 frappe-gantt 部分源码
2. 绘制逻辑部分采用 zrender 重写
3. 左侧 table 基于 elementui 写，实现 `transform: translate3d(0px, yypx, 0px);` 无限滚动
4. 滚动设计：table 保留滚动条，基于 `scroll` 事件实现滚动；gantt 无滚动条，gantt 采用 `mousewheel` 事件触发滚动联动

### 4.2 性能保障

对于数据条目过多，比如几千、几万，需要保证用户使用无卡顿，及时响应用户各项操作，左右侧滚动联动顺滑

1. 左侧 table 采用无限滚动，保证整体渲染条目最多不超过要求阈值
2. 右侧 gantt 采用与左侧 table 条数对应内容渲染，使用 `mousewheel` 触发滚动事件，隐藏本身滚动条

### 4.3 复杂模块及估时

1. 甘特图 canvas 基本绘制：48h
2. elementui table 无限滚动实现：24h
3. 滚动联动及高亮：16h

整体估时：预计 13 天实现

## 5 最终效果

## 6 使用方式
