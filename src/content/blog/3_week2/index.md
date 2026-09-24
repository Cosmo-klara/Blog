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


| Methods | TFLOPs ↓ | Token 预算 | Acc |
|:--------|:-----|:------|:------|
| Full | 100.69 | 100% |  46.00 |
| Random | 75.86 | 35% | 43.44 |
| Dycoke(2024.11) | 81.81 | 50% | 43.66  |
| OmniZip(2025.11) | 72.04 | 45% | 45.37 |
| OmniSIFT(2026.2) | 75.10 | 35% | 45.73 |
| SEATS(2026.5) | 74.72 | 35% | 45.51 |
| OmniSelect(2026.5) | 72.22 | 45% | 45.33|
| OmniFocus(2026.7) | 68.01 | 35% | 45.29 |
| Ours | 70.11 | 33.5% | 45.52 |



### Abstract

Multimodal large language models (MLLMs) incur high inference cost due to long sequences of visual and audio tokens. Existing acceleration methods mainly study how many tokens to remove, while the question of where to perform internal pruning inside the language model remains underexplored. In this work, we propose a stability- and attention-guided layer selection strategy for efficient MLLM inference. Our method first analyzes a small calibration set to estimate layer-wise token stability from adjacent-layer hidden-state similarity and token importance from the attention mass received by multimodal tokens. It then selects a backbone-specific internal pruning layer where multimodal representations become relatively stable while still receiving substantial attention, and performs token pruning at that layer. We integrate this strategy with multimodal token compression for Qwen2.5-Omni and with internal token pruning for LLaVA-1.5, enabling evaluation across heterogeneous MLLM backbones. Experiments show that the proposed method consistently improves the accuracy-efficiency trade-off over fixed-layer and random-layer baselines, while remaining competitive with strong token compression baselines under reduced TFLOPs and token budgets. These results suggest that identifying a proper pruning stage is a key factor for efficient multimodal inference.

