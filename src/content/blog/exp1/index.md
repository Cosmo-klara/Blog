---
title: '测试实验1'
publishDate: '2025-11-25'
updatedDate: '2025-11-27'
description: 'LongVLAE 在新分割的数据集上与 Qwen2.5-omni-3B 的评估对比'
tags:
    - Record
    - Weekly_work
language: '中文'
---


## 测试实验1

### Datasets

考虑到 Qwen2.5-omni 对于显存的需求较大，基于 LongVALE 初始数据集，切割视频为 30s 内片段且保证包含时间，对于单个事件长度 > 30s 的片段，丢弃

- 视频数目：1172 -> 5386（丢弃83个原始视频）
- 事件数目：13867 -> 11612（丢弃2255个事件）

### 测试结果

#### Grounding

任务描述：输入事件，输出对应其时间戳

输入 $T_i$, 输出 $(s_i, e_i)$

|             | mIoU | R1@0.3 | R1@0.5 | R1@0.7 |
|-------------|------|--------|--------|--------|
| LongVLAE    | 46.37| 64.16  | 45.40  | 27.27  |
| Qwen2.5-omni-3B | 16.80| 19.21  | 6.98   | 2.62   |

#### Caption

任务描述：输入视频，输出视频中所有事件及其时间戳

输入 $V \in \mathbb{R}^{T \times H \times W \times C}$, 输出 $\{s_i, e_i, T_i\}$ all


#### Seg_Captioning

任务描述：输入时间片段（起始时间 $s_i$ 和结束时间 $e_i$），输出对应时间片段中的事件

输入 $(s_i, e_i)$, 输出 $T_i$


