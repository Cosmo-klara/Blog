---
title: 'vllm-qwen2.5-omni'
publishDate: '2025-12-2'
updatedDate: '2025-12-3'
description: 'qwen2.5-omni vllm'
tags:
    - Record
    - Weekly_work
language: '中文'
---

## Record

### 2025-12-1

修改 qwen_eval prompt 进行新测试

### 2025-12-2

vllm 环境搭建及 debug

先试了 qwen-2.5-omni 仓库自己给的方法，完全不可行，一看 issue 差评如潮

> 一个搞笑的，由于他们把根目录占满了，我删除环境的时候报错空间不足还删不了，只能 \rm -rf 掉环境

```zsh
conda create --prefix /data1/conda/vllm-qwen python=3.12 -y
conda activate /data1/conda/vllm-qwen
pip install --upgrade uv
# 下载 xformers-0.0.29.post2-cp312-cp312-manylinux_2_28_x86_64.whl
# 重命名 xformers-0.0.29.post2-cp312-cp312-manylinux2014_x86_64.whl
pip install xformers-0.0.29.post2-cp312-cp312-manylinux2014_x86_64.whl
uv pip install vllm --torch-backend=auto --no-build-isolation
```


