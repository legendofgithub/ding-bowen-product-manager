# 自定义域名 HTTPS 与域名验证 · 记录与排障

> 本文档记录 `dingbowen.tech` 的 GitHub Pages 自定义域名 HTTPS 问题从定位到修复的完整过程，
> 以及再次出现同类问题时的标准处置流程。**2026-10-11 已修复完成**，当前为正常状态。

## 一、当前正常状态（基线）

发生任何异常时，先对照下表确认偏离了哪一项。

| 检查项 | 期望值 |
|---|---|
| 证书 subject | `dingbowen.tech`（**不是** `*.github.io`） |
| 证书 SAN | `DNS:dingbowen.tech, DNS:www.dingbowen.tech` |
| 签发机构 | Let's Encrypt |
| `https://dingbowen.tech` | `200`，`ssl_verify_result=0`（严格校验通过） |
| `http://dingbowen.tech` | `301` → `https://dingbowen.tech/` |
| `https://www.dingbowen.tech` | `301` → `https://dingbowen.tech/` |
| GitHub Profile 设置 | Settings → Pages → Verified domains 显示 `dingbowen.tech Verified` |
| 仓库 Pages 设置 | Custom domain = `dingbowen.tech`，**Enforce HTTPS 已勾选** |

### 各域名/记录的权威答案

```
A     @                             185.199.108.153
A     @                             185.199.109.153
A     @                             185.199.110.153
A     @                             185.199.111.153
CNAME www                           legendofgithub.github.io
TXT   _github-pages-challenge-legendofgithub   0420cec2ace5463637649025b17c9a
```

- NS：`dns19.hichina.com` / `dns20.hichina.com`（阿里云云解析）
- 仓库根目录 `CNAME` 文件内容：`dingbowen.tech`

> **警告：`_github-pages-challenge-legendofgithub` 这条 TXT 记录不要删除。**
> 删掉会导致域名验证失效，进而可能触发域名被他人接管的接管攻击风险。

## 二、故障根因（2026-10 的那次）

**不是 DNS 配错，而是域名所有权验证从未完成。**

判据（当时实测）：

1. 证书 subject 为 `CN=*.github.io`，SAN 里**完全没有** `dingbowen.tech`
   —— 这是 GitHub Pages 的兜底通配符证书，说明 GitHub 从未为该域名签发过证书。
2. `_github-pages-challenge-legendofgithub.dingbowen.tech` 的 TXT 记录**不存在**。
3. 仓库 Pages 设置里 **Enforce HTTPS 一直是灰的**，提示
   "Unavailable for your site because your domain is not properly configured to support HTTPS"。
4. 当时 DNS 完全干净：4 条 A 记录正确、www CNAME 正确、无 CAA 限制、ACME 路径可达。

**最关键的一点：域名验证入口不在仓库设置里，在「个人 Profile 设置」里。**

```
✅ https://github.com/settings/pages                    ← 域名验证在这里（Profile 级）
❌ https://github.com/<用户>/<仓库>/settings/pages      ← 这里只配 custom domain，没有验证入口
```

这是当初长时间没能解决的主要原因——在仓库设置里反复找，永远找不到验证按钮。

## 三、标准修复流程（再次出现同类问题时照做）

### 步骤 1 · 完成域名所有权验证

1. 打开 `https://github.com/settings/pages`
2. **Add a domain** → 输入 `dingbowen.tech` → **Add domain**
3. 页面会给出要添加的 TXT 记录（主机记录 + 一串 hex token）
4. 到**阿里云云解析控制台** `https://dns.console.aliyun.com/` → `dingbowen.tech` → 解析设置 → **添加记录**：

   | 字段 | 填写内容 |
   |---|---|
   | 记录类型 | `TXT` |
   | 主机记录 | `_github-pages-challenge-legendofgithub`（**不要**带 `.dingbowen.tech` 后缀，控制台自动拼接） |
   | 记录值 | GitHub 给出的 hex token |
   | TTL | 10 分钟（默认） |

5. 核验公网生效（三处应一致）：

   ```powershell
   Resolve-DnsName "_github-pages-challenge-legendofgithub.dingbowen.tech" -Type TXT -Server 223.5.5.5
   Resolve-DnsName "_github-pages-challenge-legendofgithub.dingbowen.tech" -Type TXT -Server 8.8.8.8
   Resolve-DnsName "_github-pages-challenge-legendofgithub.dingbowen.tech" -Type TXT -Server dns19.hichina.com
   ```

6. 回到 GitHub 该域名页面点 **Verify**，成功后 Profile 的 Pages 设置里会显示 `dingbowen.tech Verified`

### 步骤 2 · 开启 Enforce HTTPS

1. 打开仓库 `https://github.com/legendofgithub/ding-bowen-product-manager/settings/pages`
2. 确认 Custom domain 为 `dingbowen.tech`
3. 等证书签发（域名验证通过后通常数分钟内自动签发），**Enforce HTTPS** 由灰变可选后勾选
4. 页面顶部 "Your site is live at ..." 会从 `http://` 变为 `https://`

> 页面上的 **"DNS Check in Progress" 是非阻塞提示**，证书已签发时忽略它即可，
> 不要因为它反复保存/删除自定义域名。反复折腾只会让 GitHub 的检查流程更难收敛。

### 步骤 3 · 验证

```powershell
# ① 证书是否已换成域名专属证书（看 subject 是否为 dingbowen.tech）
node -e "import('node:tls').then(tls=>{const s=tls.connect({host:'dingbowen.tech',port:443,servername:'dingbowen.tech'},()=>{const c=s.getPeerCertificate();console.log(c.subject.CN);console.log(c.subjectaltname);console.log(c.valid_to);s.end();});})"

# ② HTTP 是否 301 跳 HTTPS
curl.exe -sSI http://dingbowen.tech | Select-String "^HTTP|^Location"

# ③ HTTPS 严格校验
curl.exe -sS -o NUL -w "code=%{http_code} tls=%{ssl_verify_result}`n" https://dingbowen.tech
```

## 四、排障陷阱（踩过的坑）

### 坑 1 · 直连测 HTTP 会得到假阳性

国内运营商存在**透明 HTTP 缓存**。直连 `http://dingbowen.tech` 可能拿到
`200 OK` + `Age: 468` 的**陈旧缓存响应**，看起来像"没跳转 HTTPS"，实际源站已经是 `301`。

**判据**：看响应头里的 `Age` 和 `X-Cache`。

- `X-Cache: HIT` + `Age` 很大 → 命中边缘/运营商缓存，结论不可信
- `X-Cache: MISS` + `Age: 0~5` → 源站实时响应，结论可信

**对策**：走代理或换网络复测，并加随机查询串绕过缓存：

```powershell
curl.exe -sSI -x http://127.0.0.1:7897 http://dingbowen.tech
node -e "fetch('http://dingbowen.tech/?cb='+Date.now(),{redirect:'manual'}).then(r=>console.log(r.status,r.headers.get('location')))"
```

### 坑 2 · `curl` 默认 UA 会被 GitHub 边缘拦截

`curl/x.y` 的 User-Agent 访问 `https://dingbowen.tech` 可能返回
`403 Forbidden`（Varnish 拦截）。验证时务必带浏览器 UA：

```powershell
curl.exe -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36" https://dingbowen.tech
```

### 坑 3 · 浏览器自动化需要显式配置代理

本机 `github.com` 直连被墙（`ERR_CONNECTION_TIMED_OUT`），必须走系统代理
`127.0.0.1:7897`（Clash Verge）。命令行 Chrome 不会自动继承系统代理设置，
需要显式加参数：

```
--proxy-server=http://127.0.0.1:7897
--proxy-bypass-list=localhost;127.0.0.1;<local>
```

### 坑 4 · 点击页面元素前必须先滚动到视口内

`getBoundingClientRect()` 返回的坐标若在视口外（`y > window.innerHeight`），
CDP 的 `Input.dispatchMouseEvent` 坐标点击会**静默落空**。
必须先 `scrollIntoView({block:'center'})` 再取坐标。此坑已在本目录脚本中修复。

### 坑 5 · GitHub 设置页是 React 应用，抓取要等渲染

直接 `Page.reload` 后立即取 `document.body.innerText` 会拿到未渲染的空壳。
应轮询等待关键文本（如 `Enforce HTTPS`）出现后再读取。

## 五、结论与后续

- **根因**：域名所有权验证缺失 → GitHub 拒绝签发自定义域名证书 → Enforce HTTPS 不可用。
- **解决**：补齐验证 TXT 记录并 Verify；证书随即自动签发，Enforce HTTPS 变为可选并已开启。
- **证书有效期至 2027-01-09**，GitHub Pages 会在到期前自动续期，无需人工干预。
- **若再次出现 `*.github.io` 兜底证书**：先查 TXT 记录是否还在（很可能被误删），
  然后按第三节流程重走一遍；若 DNS 全部正确且超过 24 小时仍不签发，
  再带下方"诊断包"提交 GitHub Support 工单，请其人工重排证书签发。

### 备用：GitHub Support 诊断包

```
Repo      : legendofgithub/ding-bowen-product-manager (public, has_pages=true)
Domain    : dingbowen.tech  (+ www CNAME -> legendofgithub.github.io)
DNS       : A 185.199.108.153 / .109 / .110 / .111  (only these 4)
            TXT _github-pages-challenge-legendofgithub = 0420cec2ace5463637649025b17c9a
            no CAA record, no extra A/AAAA
CNAME file: "dingbowen.tech"
Verified  : domain verified in profile settings (shows "Verified")
Symptom   : HTTPS SNI returns CN=*.github.io instead of a dedicated cert
Request   : please re-queue Let's Encrypt issuance for this hostname
```

## 六、本地自动化脚本（`.dsh-browser/`，已被 git 忽略）

排查过程中沉淀了一套零依赖的 CDP 浏览器自动化脚本，可复用于同类控制台操作：

| 脚本 | 用途 |
|---|---|
| `launch.ps1` | 启动带调试端口 + 代理的 Chrome（独立配置目录，不动日常浏览器数据） |
| `cdp.mjs` | 基础操作：`tabs` / `open` / `nav` / `text` / `eval` / `shot` / `url` |
| `click.mjs` | 真实鼠标点击（`Input.dispatchMouseEvent`，可触发 React 事件） |
| `type.mjs` | 真实键盘输入（`Input.insertText`，可触发 React 受控表单） |
| `watch-cert.mjs` | 轮询 TLS 证书，检测域名专属证书是否签发 |
| `enforce-https.mjs` | 检查/点击仓库 Pages 的 Enforce HTTPS 开关 |
| `monitor-https.mjs` | 持续监控 Enforce HTTPS 可用性并自动开启 |

该目录已写入 `.gitignore`，不会被提交。
