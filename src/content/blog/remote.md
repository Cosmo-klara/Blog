---
title: '实验室服务器连接'
publishDate: '2025-10-12'
updatedDate: '2025-12-16'
description: '记一下连接远程服务器的步骤'
tags:
    - Record
language: '中文'
---

# 实验室服务器连接

## 生成公钥并添加到服务器

> 你自己能连服务器的情况下, 如果不行的话得先找学长让他帮你传一下公钥

`cmd` 打开终端, 键入 `ssh-keygen -t rsa` 生成公钥和私钥, 按照提示输入密钥文件的保存路径和密码（其实一直回车就行）, 然后应该能看到保存的位置, 比如说： `C:\\Users\\Administrator\\.ssh` 下面,  找到 `id_rsa.pub` 这个文件, 打开并复制里面的内容

用你能连上服务器的电脑连接服务器, 键入

```zsh
cd ~/.ssh
vim authorized_keys
```

在里面添加你复制的公钥, 一般格式为

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQ... = ...@...
```

然后就能直接无密码登录了 

## 服务器连接外网（校园网）

连接服务器后需要先进行网络配置, 也即将 BIT-srun-login-script 项目clone到服务器上

> 该项目依赖于requests库, 建议 pip install requests 后再尝试运行

其中always_online.py中的用户和密码需要替换为你的校园网账户密码

```bash
cd BIT-srun-login-script
python always_online.py
```

验证网络环境, `ping baidu.com` 测试一下能不能 ping 通

## ssh 连接配置

```bash
ssh 10.1.114.75
```

## 服务器使用本机代理

首先打开 clash 或者其他基于此内核的代理软件, 开启允许局域网和系统代理

本机在输入

```shell
ssh -p 22 username@server_ip -R 7890:localhost:7891
```

> 第一个 7890 是本地代理端口, 7891 是远程代理端口

修改环境变量配置代理端口

```bash
export http_proxy="http://127.0.0.1:7891"
export https_proxy="http://127.0.0.1:7891"
```

或者在代码中添加

```python
import os
os.environ["http_proxy"] = "http://127.0.0.1:7891"
os.environ["https_proxy"] = "http://127.0.0.1:7891"
```


## VSCode 连接

回退版本, 或者在 WSL 中使用旧版本的 vscode 进行连接（这样可以双开）


## Trae CN 连接

> 非常神人的, Trae 的外版在远程后 Jupyter 插件无法安装, CN 版可以正常安装

由于 vscode 开发团队在新版本停止了对旧版本 `glibc` 和 `libstdc` (`glibc >= 2.28, libstdc++ >= 3.4.25`) 的支持, 而实验室服务器仍采用 Ubuntu 18.04, 其默认 `glibc` 版本为 2.27, 因此无法正常 ssh 远程连接。

**用 `brew` 安装 `glibc` 和 `patchelf`**

1. 安装 `brew`

```zsh
mkdir -p ~/.linuxbrew
git clone https://github.com/Homebrew/brew ~/.linuxbrew/Homebrew
mkdir -p ~/.linuxbrew/bin
ln -s ~/.linuxbrew/Homebrew/bin/brew ~/.linuxbrew/bin

# 写到 ~/.zshrc 里面
export PATH="$HOME/.linuxbrew/bin:$PATH"
export MANPATH="$HOME/.linuxbrew/share/man:$MANPATH"
export INFOPATH="$HOME/.linuxbrew/share/info:$INFOPATH"

# 重新加载配置
source ~/.zshrc
```

2. 安装 `glibc` 和 `patchelf`

```zsh
brew --prefix glibc
# Output: /home/username/.homebrew/opt/glibc (example output)

brew install patchelf
which patchelf
# Output: /home/username/.homebrew/bin/patchelf
```

3. 配置环境变量

将下面的环境变量写入 `~/.zshrc` 或 `~/.bashrc` 中：

> username 是用户名, 根据实际情况替换, 由于我们的是老师姓名, 就 hide 了

```zsh
export VSCODE_SERVER_CUSTOM_GLIBC_LINKER=/home/username/.linuxbrew/opt/glibc/lib/ld-linux-x86-64.so.2
export VSCODE_SERVER_CUSTOM_GLIBC_PATH=/home/username/.linuxbrew/opt/glibc/lib
export VSCODE_SERVER_PATCHELF_PATH=/home/username/.linuxbrew/bin/patchelf
```

```zsh
vim ~/.zshrc
# 写入环境变量
source ~/.zshrc
```

现在打开 Trae CN 进行连接, 即可正常使用, 出现弹窗警告是正常情况, 点击继续连接即可

> 仍然存在的问题, AI 功能无法使用, 终端无显示




