---
title: '使用 Cloudflare Tunnel 规避国内备案阻断'
slug: '20260123-2edc'
description: '未备案的域名无法在国内访问，但是有一种巧妙的方法绕过。'
createdAt: '2026-01-23 12:00'
updatedAt: '2026-01-23 10:41'
completed: true
top: false
tags: ['Ubuntu/Debian']
---

如果直接使用 Cloudflare 的 DNS 把未备案的域名解析到国内服务器，会报 403 错误。但是备案流程很繁琐，因此才有了这个教程。

## 安装

你可以在[这里](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/#linux)找到
`cloudflared` 的安装方式。

或者直接一点：

```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

## 认证与创建隧道

此步骤会生成凭证文件，务必按照顺序操作：

1. **登录授权：**

    ```bash
    cloudflared tunnel login
    ```

    复制终端出现的 URL 到浏览器完成授权。

2. **创建隧道：**

    ```bash
    cloudflared tunnel create aliyun-tunnel
    ```

    记下输出的 **Tunnel ID**。

3. **配置 DNS 解析（CNAME）：** 将域名流量指向该隧道：

        ```bash
        cloudflared tunnel route dns aliyun-tunnel api.yoake.cc
        cloudflared tunnel route dns aliyun-tunnel list.yoake.cc
        ```

## 迁移凭证

为了避免 `sudo service install` 找不到配置文件，直接将凭证迁移到系统级目录：

```bash
sudo mkdir -p /etc/cloudflared/
sudo mv ~/.cloudflared/*.json /etc/cloudflared/
sudo mv ~/.cloudflared/*.pem /etc/cloudflared/
```

## 编写配置文件

编辑 `/etc/cloudflared/config.yml` 文件：

```yaml title="/etc/cloudflared/config.yml"
tunnel: <Tunnel_ID>
credentials-file: /etc/cloudflared/<Tunnel_ID>.json

protocol: http2

ingress:
  - hostname: api.yoake.cc
    service: http://localhost:8080

  - hostname: list.yoake.cc
    service: http://localhost:3000

  # 兜底规则（必须存在且放在最后）
  - service: http_status:404
```

## 服务注册

将隧道注册为 systemd 服务，实现开机自启和后台运行：

```bash
# 安装服务
sudo cloudflared service install

# 启动并设置开机自启
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## 验证

在任意终端执行 `curl -v -k https://api.yoake.cc` ，若其中：

- `Server: cloudflare`

  说明 DNS 正确解析到了 Cloudflare 的 Anycast IP，外部流量入口已由 CF 接管。

- `HTTP/1.1 302 Found`

  说明 Cloudflare 通过隧道转发给了服务。

- `x-response-time: 2.575ms`

  说明服务运行正常。
