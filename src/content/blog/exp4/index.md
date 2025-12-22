---
title: 'qwen2.5-omni lora 及调研'
publishDate: '2025-12-22'
updatedDate: '2025-12-23'
description: 'qwen2.5-omni lora 及调研'
tags:
    - Record
    - Weekly_work
language: '中文'
---


## Record

在 https://github.com/Cosmo-klara/Qwen_R 可以获取本周的代码变动

### 2025-12-18

+ 解决没有 loss 的问题，由于训练数据和 transformer 中标准的格式不同，label 需要自己选择，实现后 labels 有效 token 只剩 <|VIDEO|>，未包含 assistant 文本

debug：一直都是 |VIDEO| 占位符

QwenOmniProcessor 会在 视频 patch 展开后动态插入 <|VIDEO|> token，如果按“字符位置 / 拼接文本”计算 labels，对齐关系会被破坏，assistant token 的真实位置只能在 processor 之后的 input_ids 中确定。在 processor 输出的 input_ids 中定位 <|im_start|> assistant，只对 assistant 回复区间做 label，其余位置置为 -100 mask 掉。

+ 解决没有梯度的问题，Loss requires_grad: False，loss 有值但 loss.requires_grad=False

因为用了 model.gradient_checkpointing_enable()，得启用 model.enable_input_require_grads()

### 2025-12-19

由于数据集存在多轮次对话，之前实现的时候处理的是拆成多个单轮对话，不过这样训练时间显著增加（370h），因为相当于近 10 倍音视频特征提取的次数，看了 LongVALE 的 dataset 实现，发现是直接将多轮次对话拼接起来，只做一个超长度后按轮次截断的处理。

重新实现了多轮对话训练的策略，实现了和 LongVALE 类似的策略，通过了单元测试，只是没卡跑不了还

### 2025-12-21

没卡用，被占满了，看论文和找数据集

VideoLLaMA 2/ Fork-Merge Decoding


Apollo: An Exploration of Video Understanding in Large Multimodal Models

![](assets/1.jpeg)

这个的有点像 [Q-Former](https://arxiv.org/abs/2303.15105)，应该是源自 [Perceiver: General Perception with Iterative Attention](https://arxiv.org/abs/2103.03206)

或许这种架构更适合长视频？里面还提到使用 fps 比均匀采样效果更好，但实际上似乎是因为每帧令牌数（tpf）

### 2025-12-22

等卡，写了一个先把音频提出来的脚本，理论上节省一下训练时提取音频的时间；






