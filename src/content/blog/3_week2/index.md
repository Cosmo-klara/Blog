---
title: 'week2 Record '
publishDate: '2026-09-18'
updatedDate: '2026-09-22'
description: ''
tags:
    - Record
    - Weekly_work
    - PaperReading
language: '中文'
---

## Record

### 本周工作

### Qwen2.5-omni 3B


| Methods | TFLOPs ↓ | Token 预算 | WorldSense Acc ↑ | DailyOmni ↑ | OmniVideo Bench ↑ | VideoMME ↑ |
|:--------|:-----|:------|:------|
| Full | 100.69 | 100% | 46.00 | 64.51 | 33.5 | 67.6 |
| Random | 75.86 | 35% | 43.44 | - | - | - |
| Dycoke(2024.11) | 81.81 | 50% | 43.66 | - | - | - |
| 0mniZip(2025.11) | 70.99 | 35% | 43.88 | 56.05 | 32.3 | 63.5 |
| OmniSIFT(2026.2) | 75.10 | 35% | 45.73 | 65.3 | 33.7 | 64.22 |
| SEATS(2026.5) | 74.72 | 35% | 45.60 | 61.17 | 34.48 | 65.60 |
| OmniSelect(2026.5) | 72.22 | 45% | 45.26 | 58.54 | 32.97 | 64.43 |
| OmniFocus(2026.7) | 68.01 | 35% | 45.29 | 58.23 | 32.78 | 65.11 |
| Ours | 70.11 | 33.5% | 45.52 | 60.21 | 33.68 | 64.58 |

### llava-v1.5-7b

| Methods | TFLOPs ↓ | MME ↑ | MMMU acc ↑ |
|:--------|:-----|:------|:------|
| Full | 3.233 | 1509.97 |  36.43 |
| FastV(2024) | 1.869 | 1422.18 | 33.13 |
| VTW (K=16)(2024.5) | 1.782 | 1442.67 | 35.60 |
| DivPrune(2025.4) | 0.512 | 1328.3 | 35.89 |
| Ours(14) | 1.670 | 1498.33 | 36.17 |


### NAACL

[LVPruning: An Effective yet Simple Language-Guided Vision Token Pruning Approach for Multi-modal Large Language Models](https://arxiv.org/abs/2501.13652)

cross-attention


### 1

Understanding Internal Pruning Stages in Multimodal LLMs via Layer-wise Interaction Dynamics

#### Abstract

Although token pruning is widely used to accelerate multimodal large language models (MLLMs), the choice of an internal pruning layer remains largely heuristic. We analyze the layer-wise interaction dynamics of MLLMs and find that effective pruning layers consistently appear when multimodal representations have become relatively stable while multimodal tokens still receive substantial attention. Based on this observation, we propose an interpretable, training-free, and calibration-based criterion that combines representation stability and multimodal attention to select internal pruning layers. Experiments on heterogeneous multimodal backbones show that the proposed criterion improves the accuracy-efficiency trade-off over random and fixed-layer baselines under reduced token budgets and TFLOPs. These results suggest that effective internal pruning is governed by shared layer-wise regularities rather than ad hoc layer choices.

#### Introduction

background： MLLMs 长序列 显存开销、推理速度；

已有研究：进入 LLM 前后剪枝，进入 LLM 前剪枝比较成熟，进入 LLM 后剪枝在哪一层剪现有工作虽然在不同层做过 pruning，但是（启发式，经验，泛用性差依赖backbone模型）

核心观察：有效剪枝层通常不是最早层也不是最晚层，而是处在主要 multimodal interaction 已发生后且 token 仍有较高 attention participation的阶段。

概述方法：提出了一个 training-free, calibration-based, interpretable 选层打分方法，并在异构 backbone 上实验验证了其有效性，说明方法泛用性

陈列贡献点：


#### related work

从 基础剪枝实验找最优层 到 经验性剪枝层选择探索 到 分析选择剪枝层

#### Probing Layer-wise Multimodal Interaction

放图 逐层 token 余弦相似度/ attention / cross-attention

@核心观察，多模态信息在层中交互的大体位置

多个模型呈现出相似的趋势可以印证 @核心观察

#### Method

定义打分公式

（这里需要对公式进行解释比如为什么需要某个项吗？）

通过小数据集给模型打分

说明剪枝方法

#### Experiment

实验设置：

表：主实验（Qwen2.5-omni 的效果）

图：横轴 layer i 纵轴 Performance

图: 横轴 score i 纵轴 Performance (标点)，给线性系数（只统计最优点之前的层及最优点，因为后面层因为有 Flops 的负权会变低）

消融表：公式拆项

Cross-Backbone 的实验效果








