---
title: 'VSCode Remote SSH 复用本地代理'
slug: '20260119-f6bf'
description:
  '很多情况下内网服务器无法直连外网，导致安装依赖或使用 AI 助手受阻。本文介绍一种通过 SSH Remote
  Forward 复用本地代理的完美方案。'
createdAt: '2026-01-19 12:00'
updatedAt: '2026-01-19 11:37'
completed: true
top: false
tags: ['Ubuntu/Debian']
---

本方案利用 SSH 的 Remote
Forward 功能，将远程服务器的流量转发到本地，并使用本机代理科学出网。本方案无需在服务器安装任何软件和 root 权限，完全依赖 SSH 本身的功能。

## SSH 远程转发

编辑本地的 `~/.ssh/config` 文件，找到对应的主机配置，添加一行 `RemoteForward` 规则：

```
Host 10.212.160.162
    HostName 10.212.160.162
    User root
    RemoteForward 47890 127.0.0.1:7890
```

> [!tip] 配置说明该指令将远程服务器的 `47890` 端口映射到本地（本机）的 `7890` 端口。

## 配置 Shell 代理

登录远程服务器，输入以下命令临时设置环境变量：

```bash
export http_proxy="http://127.0.0.1:47890"
export https_proxy="http://127.0.0.1:47890"
export all_proxy="http://127.0.0.1:47890"
```

此时 Shell 的网络流量已通过代理转发。执行命令 `curl -I https://www.google.com`，若返回
`HTTP/1.1 200 OK` 则说明配置成功。

> [!tip] 使代理永久生效若希望代理永久生效，请将上述命令追加到 `~/.bashrc` 或 `~/.zshrc` 文件末尾。

## 配置 VSCode 代理

VSCode 及其扩展（如 GitHub
Copilot）通常不直接读取 Shell 环境变量，需要在 VSCode 的远程配置文件中显式指定。

打开远程设置文件（通常路径为 `~/.vscode-server/data/Machine/settings.json`），添加或修改以下字段：

```json
{
  "http.proxy": "http://127.0.0.1:47890",
  "http.proxyStrictSSL": false,
  "http.proxySupport": "on",
  "remote.env": {
    "HTTP_PROXY": "http://127.0.0.1:47890",
    "HTTPS_PROXY": "http://127.0.0.1:47890",
    "ALL_PROXY": "http://127.0.0.1:47890"
  }
}
```

保存文件并重载 VSCode 窗口。检查 GitHub Copilot 状态图标是否正常，或尝试进行一次 AI 对话。
