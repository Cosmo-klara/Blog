---
title: 'PPT 公式临时生成处'
publishDate: '2025-10-22'
updatedDate: '2025-10-23'
description: 'PPT 没法插入公式，用这个页面临时生成公式图片作为插入'
tags:
    - Record
language: '中文'
---




$V \in \mathbb{R}^{T \times H \times W \times 3}$

$A \in \mathbb{R}^{T}$

$M \in \mathbb{R}^{T \times H \times W \times K}, \text{ K 为音频事件类别数}$


- 输入：原始音频重采样为单声道、16kHZ 采样率：

$X[n], \text{ n = 1, .., 16000×T; T 为原始音频长度}$

- STFT 变换：得到一个复数矩阵（表示不同时间帧上的频谱）

> 0.96s 划分音频为 L 片，$0.96s / 10ms = 96$（每个音频片上的时间帧数）

$X[n]——^{STFT}——|X(t,f)|, \text{ t = 96}$

- Mel 滤波：将 STFT 变换后的频谱映射到 Mel 频率空间

$|X(t,f)|——^{Mel}——|X(t,m)|, \text{ m = 64}$

在这步变换后我们取得梅尔谱 $A_s \in \mathbb{R}^{T \times 96 \times 64}, \text{ T 为帧数，也即时间片数}$

可以形象的把 $A_s$ 看作是一个由 T 张 96x64 的图片组成的集合，类似与视频的一帧一帧图片，把其输入到 VGGish 卷积神经网络中

- VGGish 卷积神经网络：

    移除最后的压缩操作，（96, 64, 1）——— (6, 4, 512)

    得到最终的特征向量 $A \in \mathbb{R}^{T \times S \times C^a}$

    其中 $C^a$ 为 VGGish 卷积神经网络的输出通道数，也即特征维度数，这里为 512。

    ```python
    NUM_FRAMES = 96  # Frames in input mel-spectrogram patch.
    NUM_BANDS = 64  # Frequency bands in input mel-spectrogram patch.
    EMBEDDING_SIZE = 128  # Size of embedding layer.

    net = slim.conv2d(net, 64, scope='conv1')  # 输出形状为 (96, 64, 64)
    net = slim.max_pool2d(net, scope='pool1')  # 输出形状为 (48, 32, 64)
    net = slim.conv2d(net, 128, scope='conv2')  # 输出形状为 (48, 32, 128)
    net = slim.max_pool2d(net, scope='pool2')  # 输出形状为 (24, 16, 128)
    net = slim.repeat(net, 2, slim.conv2d, 256, scope='conv3')  # 输出形状为 (24, 16, 256)
    net = slim.max_pool2d(net, scope='pool3')  # 输出形状为 (12, 8, 256)
    net = slim.repeat(net, 2, slim.conv2d, 512, scope='conv4')  # 输出形状为 (12, 8, 512)
    net = slim.max_pool2d(net, scope='pool4')  # 输出形状为 (6, 4, 512)

    net = slim.flatten(net)
    net = slim.repeat(net, 2, slim.fully_connected, 4096, scope='fc1')

    net = slim.fully_connected(net, params.EMBEDDING_SIZE, scope='fc2',
                                activation_fn=None)
    ```


原始视频： $I \in \mathbb{R}^{T \times H \times W \times 3}$
原始图像： $I_t \in \mathbb{R}^{H \times W \times 3}$

通过视觉编码器（如 Swin Transformer），提取多尺度图像特征: $V_i \in \mathbb{R}^{H_i \times W_i \times C^v_i}$

其中 $H_i, W_i$ 为不同尺度的图像高度和宽度，$C^v_i$ 为视觉编码器的输出通道数，也即特征维度数。

$V=\{V_i\}^5_{i=2}, H_i=H/2^i, W_i=W/2^i$

其中 $V_2$ 用于后续输入 PPQG 模块进行视觉查询

$V_3, V_4, V_5$ 用于后续输入迭代 Transformer 解码器进行多尺度视觉增强。


PPQG 模块的输入：

$V_2 \in \mathbb{R}^{H_2 \times W_2 \times C^v_2}$

$A_t \in \mathbb{R}^{S \times C^a} (t=1, .., T; A \in \mathbb{R}^{T \times S \times C^a})$


### 视觉嵌入聚合（Visual Embedding Aggregation）

定义一个中间特征 $V^h =  \text{Conv}_{1 \times 1} \left( \delta \left( \text{Conv}_{3 \times 3} \left( \delta \left( \text{Conv}_{1 \times 1} \left( \mathbf{V}_2 \right) \right) \right) \right) \right)$

此时， $V^h \in \mathbb{R}^{H_2 \times W_2 \times C^h}$

$V^e = \text{Reshape}\left(\text{MLP}\left(\text{Reshape}\left(V^h\right)\right)\right)$

$V^h =[i,j,c] —— V^h=[c,{index}], {index}=(i-1)W_2+j$

$V^h \in \mathbb{R}^{C^h \times (H_2W_2)}$, $C^h$ 个（$H_2W_2$）的向量

此时再通过 MLP 将（$H_2W_2$）映射到 N（视觉查询的个数，100，对应视觉查询区域），然后进行一次转置，得到 $V^e \in \mathbb{R}^{N \times C^h}$， N 个$C^h$ 的向量，相当于把整个图像分成了 N 块，每个块上分别有其 $C^h$ 维的特征值。

### 音频原型提示（Audio Prototype Prompting）

原始音频经过 VGGish 提取后（论文符号）：$A \in \mathbb{R}^{T \times S \times C^a}$

* 取某一时间步 (t) 的音频特征（对应视频某帧的音频段）：$A_t \equiv A[t] \in \mathbb{R}^{S \times C^a}.$

* 定义音频原型集合（可学习参数）：$P \in \mathbb{R}^{K \times C^h}$

  其中 $K$ 为原型数（音频事件类别数

* 把 $A_t$ 映射到与 $P$ 相同的向量空间（即得到与 $C_h$ 对齐的向量），记作 $\hat A_t \in \mathbb{R}^{C^h}$。

- 然后对 $\hat A_t$ 进行全局平均池化（GAP）得到 $\hat A_t \in \mathbb{R}^{C^h}$



计算音频与原型的相似度

将 $\hat A_t \in \mathbb{R}^{C^h}$ 与原型 $P \in \mathbb{R}^{K \times C^h}$ 做点积得到匹配预测 $M_t \in \mathbb{R}^{K}$

$M$ 与真实标签 $M^*$ 计算平均二元交叉熵损失：

$\mathcal{L}_{\text{pac}}(\boldsymbol{M}, \boldsymbol{M}^*) = \frac{1}{K} \sum_{k=1}^{K} \mathcal{L}_{\text{bce}}(\boldsymbol{M}_k, \boldsymbol{M}_k^*)$

$P$ 通过 $\mathcal{L}_{\text{pac}}$ 更新,每个原型逐渐收敛为一个“声音类别中心”的语义向量

交叉注意力机制提示视觉嵌入 $V_e$:

$\bar{\boldsymbol{V}}_e = \boldsymbol{V}_e + \text{Softmax}\left( \frac{(\boldsymbol{V}_e \boldsymbol{W}_1^q) (\boldsymbol{P} \boldsymbol{W}_1^k)^T}{\sqrt{C^h}} \right) (\boldsymbol{P} \boldsymbol{W}_1^v)$

$\bar{\boldsymbol{V}}_e \in \mathbb{R}^{N \times C^h}$


### 像素上下文分组（Pixel Context Grouping） 

$R = \text{Softmax}\left(\frac{(\bar V_e W_q^2)(V_h W_k^2)^\top}{\sqrt{C_h}} + G\right)$

$\hat R = \text{OneHot}(\arg\max_N R) + R - \text{sg}(R)$

$V_q = \bar V_e + \big(\text{Norm}(\hat R)(V_h W_v^2)\big)W_o$

其中：

* $G$：Gumbel 噪声；

* $\text{sg}(\cdot)$：stop-gradient；

* $\hat R$：近似 one-hot 的硬分配；

* $V_q$：最终生成的视觉查询集合（给 Transformer 解码器的输入）。


$\hat V_q \in \mathbb{R}^{N \times C^h}$

$V^h \in \mathbb{R}^{H_2 \times W_2 \times C^h}$

$V_e \cdot P \in \mathbb{R}^{N \times K}$


基于音频的查询
朴素视觉查询
带有交叉注意力
结合组注意力机制
带音频原型

不包含音频原型
包含音频原型，无损失
包含音频原型，有视觉损失
带有音频原型，带有 PAC 损失





论文中使用的是一个典型的「查询到像素」映射结构，借鉴了 MaskFormer 思想，其主要步骤如下：

首先将 Query 映射回像素特征空间，解码器最后输出的 query 集合 $V_q^{(L)}$ 与视觉特征图 $V_h \in \mathbb{R}^{H_2 \times W_2 \times C_h}$

通过点积计算相似度：$Z = V_q^{(L)} (V_h W_{proj})^\top \quad \Rightarrow \quad Z \in \mathbb{R}^{N \times (H_2W_2)}$

其中：

* 每个 query 对应一张低分辨率的 mask；
* (H_2, W_2) 通常是 backbone 特征的空间大小（比如 1/8 图像尺寸）。

重塑为空间掩码并上采样, $Z_n \in \mathbb{R}^{H_2 \times W_2}, \quad \text{for each query } n$

然后用双线性插值或转置卷积上采样到原图大小：$\hat{M}_n \in \mathbb{R}^{H \times W}$, 得到 (N) 张低分辨率掩码预测。

由于任务需要按音频类别输出，每个 query 对应一个潜在的声源实例, 但这些实例属于不同类别 (k = 1,...,K)。

于是模型会通过一个分类头（MLP）预测每个 query 属于哪个音频类别：

$
p_n = \text{Softmax}(W_{cls} V_q^{(L)} + b_{cls}) \in \mathbb{R}^{K}
$

最后，通过加权聚合得到每类的掩码：$M_{k} = \sum_{n=1}^{N} p_{n,k} \cdot \hat{M}_n$

也就是说：

* 每个 query 预测一个“掩码 + 类别分布”；
* 最终掩码按类别加权合成；
* 得到的结果：$M \in \mathbb{R}^{H \times W \times K}$

最后输出的 $M$ 会进入监督，损失函数主要由三个部分组成，即分类损失 $\mathcal{L}_{\text{cls}}$、掩码损失 $\mathcal{L}_{\text{mask}}$ 和我们提出的原型-音频对比损失 $\mathcal{L}_{\text{pac}}$。分类损失即为 CE 损失。除了 BCE 损失外，掩码损失还包含 Dice 损失 来处理图像中相对较小的前景区域。因此，方法的整体损失函数表示为：

$$
\mathcal{L} = \lambda_{\text{cls}} \mathcal{L}_{\text{cls}} + \lambda_{\text{mask}} \mathcal{L}_{\text{mask}} + \lambda_{\text{pac}} \mathcal{L}_{\text{pac}},
$$
