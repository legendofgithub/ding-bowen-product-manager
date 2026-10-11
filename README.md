# 丁博文 · 个人网站

用产品经理的方式，呈现一位产品经理——这个纯静态网站本身就是求职作品集的一部分。

- 纯静态：`index.html` + `styles.css` + `main.js`，无构建工具、无包管理器、无外部 CDN（保证加载速度与离线可用）
- 双主题：浅色 / 深色一键切换，首次访问跟随系统，选择后由 `localStorage` 记忆
- 响应式：375px / 768px / 1440px 三档稳定适配
- 无障碍：语义化 HTML5、键盘可达、`prefers-reduced-motion` 降级、正文级对比度满足 WCAG AA
- 中英双语：右上角 EN/中 一键切换，覆盖主站与 AIGC 页全部文本，选择由 `localStorage` 记忆
- 内容：全部来自本人简历（履历亮点、AI 产品知识体系、June AI 与 ai-video-eval 两款作品、工作经历、教育、荣誉）

## 目录结构

```
personal-website/
├── index.html            # 主站全部板块（单页锚点导航）
├── aigc.html             # AIGC 视频作品子页（漫剧/短片广告/创意短片）
├── styles.css            # 双主题 CSS 变量 + 响应式布局
├── main.js               # 原生 JS 交互（主题/渐显/scrollspy/打字机/板块联动）
├── i18n.js               # 中英切换字典（两个页面共用）
├── CNAME                 # GitHub Pages 自定义域名：dingbowen.tech
├── DOMAIN-HTTPS-NOTES.md # 自定义域名 HTTPS 与域名验证的记录与排障手册
├── README.md
└── assets/
    ├── profile.jpeg      # 头像（竖版证件照 270×374）
    ├── hero-life.jpg     # 首屏生活照
    ├── favicon.svg       # 站点图标
    ├── events/           # 活动现场照片（7 张）
    └── aigc/             # AIGC 视频素材与封面（7 个 mp4 + 海报）
```

> `assets/aigc/` 含 7 个 mp4，总计约 90 MB。GitHub Pages 走流式分发，
> 桌面端首屏体验正常；若在移动流量场景下在意体积，可对这些视频做二次压缩。

## 线上地址

**https://dingbowen.tech** —— 已启用 HTTPS（Let's Encrypt 域名专属证书）与强制跳转。

- 证书 subject：`dingbowen.tech`，SAN 含 `dingbowen.tech` 与 `www.dingbowen.tech`
- `http://dingbowen.tech` 与 `https://www.dingbowen.tech` 均 301 跳转到 `https://dingbowen.tech/`
- 域名已通过 GitHub Pages 所有权验证（TXT 记录见 `DOMAIN-HTTPS-NOTES.md`，**请勿删除**）

## 本地预览

没有任何依赖，直接双击 `index.html` 即可在浏览器打开（所有交互均可离线使用）。

如果想让地址栏是 `localhost`（可选）：

```bash
# 任选其一
python -m http.server 8000        # 访问 http://localhost:8000
npx serve .                       # 或用 serve
```

## 部署到 GitHub Pages

仓库已配置完成，日常更新只需推送：

```bash
git add .
git commit -m "feat: ..."
git push
```

推送后 GitHub Actions 会自动构建部署，约 1–2 分钟生效。

首次搭建时的配置为（**已配置好，仅作记录，无需重做**）：

1. 推到 GitHub 仓库 `legendofgithub/ding-bowen-product-manager`
2. 仓库 **Settings → Pages → Build and deployment**：
   - Source 选 **Deploy from a branch**
   - Branch 选 `main`，目录选 `/ (root)`
3. 仓库根目录 `CNAME` 文件内容为 `dingbowen.tech`，配合阿里云云解析的
   4 条 A 记录与 www CNAME 指向 GitHub Pages
4. 社交分享卡（`og:image` / `og:url`）已使用 `https://dingbowen.tech` 绝对地址

> **自定义域名出现 HTTPS 问题时，先查 [`DOMAIN-HTTPS-NOTES.md`](DOMAIN-HTTPS-NOTES.md)** ——
> 里面有完整的排障流程、DNS 记录清单和踩坑记录。

## 维护提示

- 后续补充产品真实截图：替换 `index.html` 中两个 `.shot-frame` 线框占位（当前刻意不放虚假截图）。
- 主题色 / 字号 / 间距都收敛在 `styles.css` 顶部的 CSS 变量里，改一处全局生效。
- 隐私：联系方式仅包含邮箱与 GitHub，不含其他敏感个人信息。
- **不要删除** DNS 里 `_github-pages-challenge-legendofgithub` 这条 TXT 记录，
  它是 GitHub Pages 的域名所有权凭证，删除后域名可能被他人接管。
- `.dsh-browser/` 为本地浏览器自动化脚本目录（已被 git 忽略），不属于站点内容，可随时删除。
