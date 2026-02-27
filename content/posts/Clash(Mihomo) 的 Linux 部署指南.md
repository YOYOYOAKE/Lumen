---
title: 'Clash(Mihomo) 的 Linux 部署指南'
slug: '20260215-e184'
description: '本方案通过 Docker 部署 Clash(Mihomo)，并使用 Cloudflare Tunnel 实现安全管理。'
createdAt: '2026-02-15 12:00'
updatedAt: '2026-02-15 15:32'
completed: true
top: false
tags: ['Ubuntu/Debian', 'Docker']
---

## Clash(Mihomo) 内核配置与订阅管理

### 环境与容器

建议统一管理 Clash 的配置文件与容器配置。推荐目录结构如下：

```
~/apps/clash/
├── docker-compose.yml
└── config/
    └── config.yaml
```

在项目根目录下创建并编辑 `docker-compose.yml` 文件：

```yaml
services:
  clash:
    image: metacubex/mihomo:latest
    container_name: clash
    restart: always
    volumes:
      - ./config:/root/.config/mihomo
    network_mode: host
```

> [!tip] 注意事项
>
> - **网络模式**：使用了 `network_mode: host`
>   模式，容器将直接共享宿主机的网络栈，Clash 配置文件中定义的端口（如 `7890` 和
>   `9090`）会直接在宿主机上监听。
> - **面板说明**：Mihomo 镜像仅包含核心功能，不含图形界面。需配合 Web
>   UI 使用，推荐使用在线面板：[Metacubexd](https://metacubex.github.io/metacubexd/)。

### 配置文件详解

通常，机场提供的订阅链接直接包含了一个完整的
`config.yaml`。直接覆盖使用虽然简单，但会导致自定义配置（如 DNS、自定义规则）丢失。

更优雅的做法是：**编写一个本地的主配置文件，通过** **`proxy-providers`** **引用机场订阅。**

以下是一个功能完备的 `config.yaml` 模板。

1.2.1 基础设置与 DNS

此配置开启了混合端口、IPv6 支持、局域网共享及增强型 DNS（Fake-IP 模式），能满足大部分需求。

```yaml
# 基础配置
mixed-port: 7890
allow-lan: true
mode: rule
log-level: info
ipv6: true
external-controller: 0.0.0.0:9090
secret: '你的API密钥' # 请修改此处的密钥，连接 Web UI 时需要
unified-delay: true
tcp-concurrent: true

# 流量嗅探 (Sniffer)
sniffer:
  enable: true
  sniff:
    HTTP: { ports: [80, 8080-8880], override-destination: true }
    TLS: { ports: [443, 8443], override-destination: true }
    QUIC: { ports: [443, 8443], override-destination: true }

# DNS 配置
dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
    - 8.8.8.8
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query
```

1.2.2 代理集合（Proxy Providers）

通过链接引用订阅，Clash 会按照指定间隔（此处是 3600 秒，即 1 小时）自动更新节点信息，并保存到
`./provides/airport.yaml` 中。

```yaml
proxy-providers:
  Airport:
    type: http
    url: '在此处填入机场订阅链接'
    path: ./providers/airport.yaml
    interval: 3600
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 300
```

1.2.3 策略组（Proxy Groups）

定义节点的选择逻辑。

```yaml
proxy-groups:
  - name: '🚀 节点选择'
    type: select
    proxies:
      - '♻️ 自动选择'
      - 'DIRECT'
    use:
      - Airport

  - name: '♻️ 自动选择'
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    use:
      - Airport

  - name: '🌍 全球直连'
    type: select
    proxies:
      - DIRECT

  - name: '🐟 漏网之鱼'
    type: select
    proxies:
      - '🚀 节点选择'
      - 'DIRECT'
```

1.2.4 规则集合（Rule Providers）

引用 Loyalsoldier 维护的规则集，保持规则的实时更新。

```yaml
rule-providers:
  reject:
    type: http
    behavior: domain
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt'
    path: ./rules/reject.yaml
    interval: 86400

  proxy:
    type: http
    behavior: domain
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt'
    path: ./rules/proxy.yaml
    interval: 86400

  direct:
    type: http
    behavior: domain
    url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt'
    path: ./rules/direct.yaml
    interval: 86400
```

1.2.5 分流规则 (Rules)

将流量匹配到对应的策略组。

```yaml
rules:
  - RULE-SET,reject,REJECT
  - RULE-SET,proxy,🚀 节点选择
  - RULE-SET,direct,DIRECT
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,🐟 漏网之鱼
```

> [!note] 规则解析
>
> - **匹配逻辑**：规则是从上往下依次执行的，一旦匹配成功，后续规则将不再执行。
> - **RULE-SET**：引用上文定义的规则集 (`rule-providers`)。
>   - `reject`：匹配广告或恶意域名，执行 `REJECT`（拒绝连接）。
>   - `proxy`：匹配国外列表（如 Google、GitHub），流量转发给 `🚀 节点选择` 策略组。
>   - `direct`：匹配国内列表（如 Bilibili、Baidu），执行 `DIRECT`（直连）。
> - **GEOIP**：基于 IP 地理位置数据库进行判断。
>   - `LAN` / `CN`：局域网或中国大陆 IP，执行直连。
> - **MATCH**：兜底规则（漏网之鱼）。如果请求没有命中上述任何一条规则，就会落入此规则，交给
>   `🐟 漏网之鱼` 策略组处理。

### 启动与验证

配置完成后，在 `docker-compose.yml` 同级目录下执行以下命令启动容器并查看日志：

```bash
docker compose up -d && docker compose logs -f
```

等待日志显示启动成功后，使用 `curl` 命令验证代理是否正常工作：

```bash
curl -I --proxy http://127.0.0.1:7890 https://www.google.com
```

如果返回 `HTTP/2 200` 或 `301` 状态码，说明服务已正常运行。

> [!tip]
>
> 初次启动故障排除 Clash 内核首次启动时会自动下载 GeoIP 数据库文件。若服务器网络环境不佳，可能会导致下载超时从而启动失败。
>
> 手动下载以下文件并上传至 `config` 目录，然后重启容器。
>
> ```bash
> wget -O Country.mmdb https://fastly.jsdelivr.net/gh/Dreamacro/maxmind-geoip@release/Country.mmdb
> wget -O geosite.dat https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat
> wget -O geoip.dat https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat
> ```

## Metacube(XD) 面板连接

Mihomo 镜像仅包含核心功能，需要通过 Web 面板进行可视化管理。

打开 [Metacubexd](https://metacubex.github.io/metacubexd/)，填写以下信息：

- **后端地址**：`http://<你的服务器公网IP>:9090` （务必放行端口）
- **密钥**：`config.yaml` 中 `secret` 字段对应的密钥

点击 **Add** 完成连接。

> [!warning]
>
> 无法连接？如果点击连接后没有任何反应或提示错误，通常由以下两个原因导致：
>
> - **云服务器安全组或防火墙未放行端口**
>
> 放行 `9090` 端口即可。
>
> - **HTTPS 混合内容拦截**
>
> 如果在线面板使用 `https://` 协议加载（如 GitHub Pages），而后端 API 地址为
> `http://`，浏览器会出于安全策略静默拦截该请求，不会在页面上给出明显提示。
>
> 若开发者工具控制台出现如下红色报错，即可确认是混合内容拦截：
>
> ```
> Mixed Content: The page at 'https://...' was loaded over HTTPS,
> but requested an insecure XMLHttpRequest endpoint 'http://...'
> ```
>
> 此时在浏览器的**网站设置中**将**不安全内容（Insecure Content）** 修改为
> **允许（Allow）**，刷新页面后重试即可。

> [!note] 使用 Cloudflare Tunnel 替代方案除了修改浏览器设置外，还可以通过 Cloudflare Tunnel 将
> `9090`
> 端口代理为 HTTPS 服务，从根本上解决混合内容拦截问题，同时避免直接暴露服务器端口，提升安全性。
>
> 参考
> [Cloudflare Tunnel 配置指南](https://www.yoake.cc/posts/20260123-2edc/#4-%E7%BC%96%E5%86%99%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)，在
> `config.yml` 的 `ingress` 中添加如下规则：
>
> ```yaml
> ingress:
>   - hostname: proxy.yoake.cc
>     service: http://localhost:9090
> ```
>
> 配置完成后，将 [Metacubexd](https://metacubex.github.io/metacubexd/) 中的**后端地址**改为
> `https://proxy.yoake.cc`即可正常连接。
