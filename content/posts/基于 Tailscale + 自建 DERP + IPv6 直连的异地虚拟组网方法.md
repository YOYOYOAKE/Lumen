---
title: '基于 Tailscale + 自建 DERP + IPv6 直连的异地虚拟组网方法'
slug: '20260126-0f56'
description:
  '通常情况下的远程访问需要自建或购买商业内网穿透服务。本文方法基于 Tailscale 组网，并使用 IPv6
  直连加速，使握手延迟降低到 30ms，文件传输速度达到 160Mbps。'
createdAt: '2026-01-26 12:00'
updatedAt: '2026-01-26 12:20'
completed: true
top: false
tags: ['Ubuntu/Debian']
---

## 技术选型

在国内大内网和多层 NAT 环境下实现内网穿透，有三种主流方案，对比分析如下：

1. DDNS + 端口映射

   这种方式利用公网 IP 配合域名解析，直接暴露端口。虽然实现原理较为简单，但是在安全性上存在显著不足，容易被攻击。且硬性要求公网 IP，IPv4 公网 IP 稀缺，IPv6 虽然普及，但是容易掉。

2. ZeroTier

   这种方式利用 VXLAN 的 P2P 虚拟局域网，但是官方根服务器在国外，国内 UDP 握手成功率较低。且自建 Moon 节点的门槛较高，受网络环境等玄学问题显著，经常出现在线但连不上的情况。

3. Tailscale

   Tailscale 基于 WireGuard 协议，通过 DERP 中转服务器辅助打洞。其优势在于 WireGuard 效率高、资源占用低，且无状态的设计能使其在 LAN、WAN、Relay 之间无缝切换。同时允许自建中转节点，解决官方节点延迟高的问题，且使用 HTTPS 协议，抗干扰能力强。

综上所述，选择 Tailscale + 自建 DERP 节点。无公网 IPv6 的情况下走 DERP 保证 100% 连通，打洞成功后走 IPv6 直连跑满带宽。

## 私有 DERP 节点

为解决 Tailscale 官网节点握手慢的问题，在阿里云北京 ECS 上搭建私有中转服务。

**derper 是 DERP 协议的具体实现。**它默认使用 **TCP 443** 端口。但是由于国内域名备案限制，这里采用
**IP + 高位端口**的方式配置。

### 安装 derper

首先确保你的电脑上有 Go 环境，且配置了国内代理：

```bash
go env -w GOPROXY=https://goproxy.cn,direct
```

然后编译安装 derper：

```bash
# 拉取最新源码并编译
go install tailscale.com/cmd/derper@latest

# 验证安装
~/go/bin/derper -h

# 移动到 /usr/local/bin
sudo cp ~/go/bin/derper /usr/local/bin/derper

# 赋予执行权限
sudo chmod +x /usr/local/bin/derper
```

### derper 节点配置

生成自签名证书：

```bash
sudo openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 \
  -nodes -keyout /etc/derper/certs/a.b.c.d.key \
  -out /etc/derper/certs/a.b.c.d.crt \
  -subj "/CN=a.b.c.d" \
  -addext "subjectAltName=IP:a.b.c.d"
```

> [!danger] 公网 IP 将所有的 `a.b.c.d` 改为**真实公网 IP**。
>
> 同时，以下所有的 `99999` 改为你的**自定义端口**。

然后配置 systemd 服务：

```toml
[Unit]
Description=Tailscale DERP Server
After=network.target

[Service]
User=root
Restart=always
ExecStart=/usr/local/bin/derper \
    -hostname=a.b.c.d \
    -a=:99999 \
    -stun-port=3478 \
    -certmode=manual \
    -certdir=/etc/derper/certs \
    -verify-clients=false

[Install]
WantedBy=multi-user.target
```

> [!tip] 端口开放这里要在入方向上开放两个端口：
>
> - TCP `99999` ：这是使用 DERP 进行中转的端口；
> - UDP `3478` ：这是 DERP 打洞使用的端口。

然后启动进程：

```bash
sudo systemctl start derper
```

### ACL 配置

接着在 Tailscale 控制台配置访问控制，强制客户端使用自建 DERP，并允许自签名证书：

```bash
"derpMap": {
    "OmitDefaultRegions": false,
    "Regions": {
        "900": {
            "RegionID": 900,
            "RegionCode": "Ali-Bj",
            "Nodes": [{
                "Name": "900a",
                "RegionID": 900,
                "HostName": "a.b.c.d",
                "DERPPort": 99999,
                "STUNPort": 3478,
                "InsecureForTests": true
            }]
        }
    }
}
```

此时在**客户端**上使用 `tailscale netcheck` 进行验证，如果显示 `Nearest DERP: Aliyun Beijing`
就证明已经连接上了自建 DERP 节点。

到此，基于 Tailscale 的虚拟组网基本结束，但是仍有一些地方值得优化。

> [!tip] 客户端防火墙设置 Tailscale 使用 UDP 41641 端口通信，因此请在客户端处放行该端口。

## IPv6 优化

仅靠阿里云 ECS 的 3M 带宽只能保证最基本的连接，无法保证大文件传输或远程桌面需求。利用双端 IPv6 实现直连是性能的关键。

你可以在 [Test IPv6](https://test-ipv6.com/) 网站上检查自己的设备是否具有公网 IPv6。

当连接双方都具有 IPv6 地址时，Tailscale 就会自动切换到直连模式。使用 `tailscale ping` 命令检查：

```
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 102ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 29ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 28ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 28ms
pong from xxx (100.x.y.z) via [a:b:c:d:e:f:g:h]:41641 in 31ms
```

刚开始 ping 时会通过 DERP 节点握手（表现为
`via DERP(Ali-Bj)`），当打洞成功时，就会自动切换到 IPv6 直连模式（表现为
`[a:b:c:d:e:f:g:h]:41641`）。

### 安全性

开启 IPv6 之后，客户端实际上是暴露在公网中的。尽管 IPv6 地址很难被扫描，但仍然存在一定风险，因此建议在 Windows 防火墙中**将获取 IPv6 地址的物理网卡改为公用网络**，**而 Tailscale 虚拟网卡改为私有网络**。

```powershell
Get-NetConnectionProfile
```

```
Name                     : 网络
InterfaceAlias           : 以太网
InterfaceIndex           : 4
NetworkCategory          : Public
DomainAuthenticationKind : None
IPv4Connectivity         : Internet
IPv6Connectivity         : Internet

Name                     : Tailscale
InterfaceAlias           : Tailscale
InterfaceIndex           : 28
NetworkCategory          : Private
DomainAuthenticationKind : None
IPv4Connectivity         : LocalNetwork
IPv6Connectivity         : NoTraffic
```

> [!tip]
> 修改网络类型使用 Get-NetConnectionProfile 获取到网卡，记住其中的 InterfaceIndex。要将指定网络修改为私有，只需要：
>
> ```powershell
> Set-NetConnectionProfile -InterfaceIndex <Index> -NetworkCategory Private
> ```
>
> 而要将指定网络修改为公用，只需要：
>
> ```powershell
> Set-NetConnectionProfile -InterfaceIndex <Index> -NetworkCategory Public
> ```

## 效果预览

**握手延迟 30ms：**

```
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 102ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 29ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 28ms
pong from xxx (100.x.y.z) via DERP(Ali-Bj) in 28ms
pong from xxx (100.x.y.z) via [a:b:c:d:e:f:g:h]:41641 in 31ms
```

**IPv6 直连带宽 160Mbps+：**

```
Connecting to host xxx, port 5201
Reverse mode, remote host xxx is sending
[  5] local 100.x.y.z port 53456 connected to 100.a.b.c port 5201
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-1.01   sec  14.5 MBytes   120 Mbits/sec
[  5]   1.01-2.01   sec  18.2 MBytes   154 Mbits/sec
[  5]   2.01-3.00   sec  23.4 MBytes   197 Mbits/sec
[  5]   3.00-4.01   sec  23.4 MBytes   194 Mbits/sec
[  5]   4.01-5.01   sec  22.8 MBytes   191 Mbits/sec
[  5]   5.01-6.01   sec  24.6 MBytes   207 Mbits/sec
[  5]   6.01-7.01   sec  19.6 MBytes   165 Mbits/sec
[  5]   7.01-8.00   sec  16.9 MBytes   142 Mbits/sec
[  5]   8.00-9.01   sec  17.0 MBytes   141 Mbits/sec
[  5]   9.01-10.01  sec  17.1 MBytes   144 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate
[  5]   0.00-10.06  sec   202 MBytes   168 Mbits/sec                  sender
[  5]   0.00-10.01  sec   198 MBytes   166 Mbits/sec                  receiver
```

完全满足 RDP/SSH 需求。
