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
A     @                                       185.199.108.153
A     @                                       185.199.109.153
A     @                                       185.199.110.153
A     @                                       185.199.111.153
CNAME www                                     legendofgithub.github.io
TXT   _github-pages-challenge-legendofgithub  0420cec2ace5463637649025b17c9a
CAA   @                                       0 issue "letsencrypt.org"
CAA   @                                       0 iodef "mailto:15611681756@163.com"
```

- NS：`dns19.hichina.com` / `dns20.hichina.com`（阿里云云解析）
- 仓库根目录 `CNAME` 文件内容：`dingbowen.tech`

> **警告 1：`_github-pages-challenge-legendofgithub` 这条 TXT 记录不要删除。**
> 它是 GitHub Pages 的域名所有权凭证，删掉会导致验证失效，域名可能被他人接管。
>
> **警告 2：两条 CAA 记录不要删除。**
> 删掉后任何 CA 都能为该域名签发证书，等于放弃了证书误签发的防护。

### 记录值格式的坑（阿里云特有）

在阿里云云解析控制台添加 **CAA** 记录时，`value` 字段**必须带双引号**，否则报
`SubDomainInvalid.Value`（解析记录值输入内容不合法或格式错误）：

| 记录类型 | 控制台 value 字段应填 | 最终生成的 DNS 记录 |
|---|---|---|
| CAA | `"letsencrypt.org"` ✅ | `0 issue "letsencrypt.org"` |
| CAA | `letsencrypt.org` ❌ 报错 | — |
| CAA | `"mailto:15611681756@163.com"` ✅ | `0 iodef "mailto:15611681756@163.com"` |

控制台会把 `flag`（0）、`tag`（issue / issuewild / iodef）与 `value` 拼接成完整记录值。
经实测，**只有带引号的写法能通过校验**——这与阿里云官方文档示例一致，
但与"value 只填域名"的字面描述不符，是个实际的踩坑点。

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
            CAA 0 issue "letsencrypt.org"   (Let's Encrypt is the intended issuer)
            CAA 0 iodef "mailto:15611681756@163.com"
            no extra A/AAAA
CNAME file: "dingbowen.tech"
Verified  : domain verified in profile settings (shows "Verified")
Symptom   : HTTPS SNI returns CN=*.github.io instead of a dedicated cert
Request   : please re-queue Let's Encrypt issuance for this hostname
```

## 六、域名防接管加固（2026-10-11 完成）

HTTPS 修好之后，又针对"域名被他人接管"做了一轮加固。核心结论：
**主接管路径已被"域名所有权验证"堵死，其余是可选的纵深防御。**

### 威胁模型：域名接管是怎么发生的

别人要抢占 `dingbowen.tech`，需要让 **他自己的** 仓库能发布到这个域名。可行路径只有：

| 路径 | 是否已被阻断 | 依据 |
|---|---|---|
| 他人仓库放 `CNAME` 文件写 `dingbowen.tech` | ✅ 已阻断 | 域名已在 Profile 设置验证，GitHub 只允许本人仓库使用 |
| 本人账号下的**其他**仓库抢占 | ✅ 已阻断 | 同上，且已确认 `ai-video-portfolio`、`personal-site` 均无 CNAME 文件 |
| 用户站点仓库 `legendofgithub.github.io` | ✅ 无此仓库 | 该仓库不存在（API 返回 404） |
| 抢注 CA 为域名签发证书 | ✅ 已阻断 | 新增 CAA 记录，只授权 Let's Encrypt |
| 恶意转出域名到其他注册商 | ✅ 已加固 | 开启「禁止转移锁」（需短信验证） |
| 篡改 DNS 解析记录 | ✅ 已加固 | 开启「禁止更新锁」（需短信验证） |
| DNS 投毒 / 中间人劫持 | ⚠️ 可选 | 可启用 DNSSEC（见下方权衡） |

### 已实施的加固

**1. GitHub Pages 域名所有权验证（根治项）**

Profile 设置 → Pages → Verified domains 显示 `dingbowen.tech Verified`。
这是防接管最关键的一环：**即使有人拿到你的 GitHub 账号去新建仓库，
他也无法把未验证域名指向自己的 Pages**。凭据是那条
`_github-pages-challenge-legendofgithub` TXT 记录。

**2. CAA 记录（限制证书签发机构）**

```
0 issue "letsencrypt.org"        # 只允许 Let's Encrypt 签发
0 iodef "mailto:15611681756@163.com"  # 有人试图违规签发时，CA 必须通知该邮箱
```

生效前后都用 Google / Cloudflare DoH 双向验证过。当前线上证书签发方正是
Let's Encrypt，与授权一致，**不会影响自动续期**。

按 RFC 6844，子域 `www.dingbowen.tech` 会继承 apex 的 CAA。

> 注意：`www.dingbowen.tech` 是 CNAME 到 `legendofgithub.github.io`。
> CAA 查找遇到 CNAME 时可能改查 `github.io` 的 CAA（那里允许 digicert /
> sectigo / letsencrypt）。实际签发者是 Let's Encrypt，两条路径都放行，因此无影响。

**3. 注册商安全锁（阿里云域名控制台 → 安全设置）**

| 锁 | 作用 |
|---|---|
| 禁止转移锁 | 域名无法被转出到其他注册商，防"偷域名" |
| 禁止更新锁 | 注册信息与 DNS 服务器不可被篡改 |

> ⚠️ 开启「禁止更新锁」后，**修改 DNS 服务器或注册信息前需先关闭它**。
> 日常增删解析记录（在云解析控制台）不受影响。

**4. 账号层**

- 域名注册商与 DNS 均开启于阿里云账号 `nick9032762768`（主账号）
- GitHub 账号已启用 2FA（GitHub 界面提示 2026-11-24 前必须完成，`Enable 2FA` 按钮可见）
- 仓库无凭据泄露：使用 Git Credential Manager，无 `~/.git-credentials` 明文文件，
  远程 URL 中不含 token

### 待你决定的可选项

**DNSSEC**：能给 DNS 应答加上密码学签名，防御 DNS 投毒与中间人劫持。
阿里云已支持，且 `.tech` 顶级域支持 DNSSEC。

- **收益**：DNS 层抗篡改，是域名安全的最后一环
- **代价**：需要先在域名控制台开启 DNSSEC 并登记 DS 记录；**若 DS 记录配置错误或
  中途失效，域名会直接解析失败（网站打不开）**，而不仅是证书问题
- **建议**：对求职作品集站点，证书 + CAA + 域名验证 + 转移锁已覆盖主要风险，
  DNSSEC 属"锦上添花"。若要开启，建议在**不赶投递的时间窗口**操作，
  并在开启后用 `dig +dnssec` 验证。

**遗留的小项**：旧仓库 `legendofgithub/Dingbowen-personal-website9.22` 里
仍残留一个内容为 `dingbowen.tech` 的 `CNAME` 文件。该仓库 `has_pages: false`
（Pages 未启用），且在域名验证机制下无法抢占域名，**属于无害的历史遗留**。
如需彻底清理，删除该仓库里的 CNAME 文件即可。

## 七、本地自动化脚本（`.dsh-browser/`，已被 git 忽略）

排查过程中沉淀了一套零依赖的 CDP 浏览器自动化脚本，可复用于同类控制台操作：

| 脚本 | 用途 |
|---|---|
| `launch.ps1` | 启动带调试端口 + 代理的 Chrome（独立配置目录，不动日常浏览器数据） |
| `cdp.mjs` | 基础操作：`tabs` / `open` / `nav` / `text` / `eval` / `shot` / `url` |
| `runjs.mjs` | 执行 JS 文件（**推荐**：绕开 PowerShell 的引号与换行转义问题） |
| `click.mjs` | 真实鼠标点击（`Input.dispatchMouseEvent`，可触发 React 事件） |
| `type.mjs` | 真实键盘输入（`Input.insertText`，可触发 React 受控表单） |
| `key.mjs` | 真实按键（如 `Escape` 关闭提示气泡） |
| `netcap.mjs` | 抓取 API 请求/响应体，用于定位静默失败 |
| `watch-cert.mjs` | 轮询 TLS 证书，检测域名专属证书是否签发 |
| `enforce-https.mjs` | 检查/点击仓库 Pages 的 Enforce HTTPS 开关 |
| `monitor-https.mjs` | 持续监控 Enforce HTTPS 可用性并自动开启 |
| `await-lock.mjs` | 等待域名锁开启并自动串联下一步 |

### 阿里云控制台自动化的三个坑（本次实测）

1. **必须用真实鼠标事件**：`element.click()` 对部分按钮无效，
   需 `Input.dispatchMouseEvent` 的 `mousePressed` + `mouseReleased`。
2. **点击前必须 `scrollIntoView`**：坐标在视口外时，CDP 点击会**静默落空**，
   没有任何报错。
3. **输入框上方常有提示气泡遮挡**：点击会被气泡拦截，
   先派发一次 `Escape` 再操作。
4. **控制台 API 有签名（`collina` 参数）**，无法脱离页面直接重放请求；
   定位失败原因要用 `netcap.mjs` 抓真实请求响应。

该目录已写入 `.gitignore`，不会被提交。
