# 甘特图架构设计

time: 2020.7.20  
author: heyunjiang

## 1 背景

需求  
1. 项目需要：业务和公共设施都需要甘特图组件
2. 可视化发展：甘特图作为可视化关键图标，在常用B端业务都会有涉及

现状  
1. frappe-gantt: github star 1.8k+，基于 svg。开源首选，满足常用甘特图功能，支持头部、表体自定义。在渲染大量数据时，有一定性能问题，作为业务备选方案
2. echarts-gantt: echarts 有简单的 gantt 组件示例，和业务需求差距甚远，需要自己使用自定义系列来实现功能，难度较大
3. tapd 甘特图：成熟系统 tapd，甘特图实现为：无限滚动table + canvas 实现
4. teambition 甘特图：无限滚动 div + svg 实现

其他暂无可以参考实现

## 2 甘特图特点

1. 左侧 table，右侧 gantt，并且要求数据匹配，滚动联动
2. 甘特图表头日期自定义
3. 表体：基本竖线、周末高亮、今日高亮、鼠标悬浮高亮
4. 元素：基本长条、拖拽改变时间、前置关系

## 3 调研分析

1. echarts 无计划支持甘特图，放弃
2. hightcharts 等其他图表库，对于 gantt 支撑也不友好

解决方案：
1. svg: 基于 frappe-gantt 继续扩展，优化以前方案
2. canvas: 基于 zrender 绘制甘特图，参考 frappe-gantt 实现一套 canvas 的
