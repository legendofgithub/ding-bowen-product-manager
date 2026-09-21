# 丁博文 · 个人网站

用产品经理的方式，呈现一位产品经理——这个纯静态网站本身就是求职作品集的一部分。

- 纯静态：`index.html` + `styles.css` + `main.js`，无构建工具、无包管理器、无外部 CDN（保证加载速度与离线可用）
- 双主题：浅色 / 深色一键切换，首次访问跟随系统，选择后由 `localStorage` 记忆
- 响应式：375px / 768px / 1440px 三档稳定适配
- 无障碍：语义化 HTML5、键盘可达、`prefers-reduced-motion` 降级、正文级对比度满足 WCAG AA
- 内容：全部来自本人简历（履历亮点、AI 产品知识体系、June AI 与 ai-video-eval 两款作品、工作经历、教育、荣誉）

## 目录结构

```
personal-website/
├── index.html          # 全部板块（单页锚点导航）
├── styles.css          # 双主题 CSS 变量 + 响应式布局
├── main.js             # 原生 JS 交互（主题/渐显/scrollspy/打字机等）
├── README.md
└── assets/
    ├── profile.jpeg    # 头像（竖版证件照 270×374）
    └── favicon.svg     # 站点图标
```

## 本地预览

没有任何依赖，直接双击 `index.html` 即可在浏览器打开（所有交互均可离线使用）。

如果想让地址栏是 `localhost`（可选）：

```bash
# 任选其一
python -m http.server 8000        # 访问 http://localhost:8000
npx serve .                       # 或用 serve
```

## 部署到 GitHub Pages

1. 把 `personal-website/` 内的全部文件推到一个 GitHub 仓库（例如 `personal-website` 或 `<用户名>.github.io`）：

   ```bash
   git init
   git add .
   git commit -m "feat: personal website v1"
   git branch -M main
   git remote add origin https://github.com/legendofgithub/<仓库名>.git
   git push -u origin main
   ```

2. 仓库 **Settings → Pages → Build and deployment**：
   - Source 选 **Deploy from a branch**
   - Branch 选 `main`，目录选 `/ (root)`，保存

3. 约 1–2 分钟后访问 `https://legendofgithub.github.io/<仓库名>/`。

4. （建议）部署后把 `index.html` 中的 `og:image` 改成绝对地址，例如
   `https://legendofgithub.github.io/<仓库名>/assets/profile.jpeg`，保证社交分享卡片正常出图。

## 维护提示

- 后续补充产品真实截图：替换 `index.html` 中两个 `.shot-frame` 线框占位（当前刻意不放虚假截图）。
- 主题色 / 字号 / 间距都收敛在 `styles.css` 顶部的 CSS 变量里，改一处全局生效。
- 隐私：联系方式仅包含邮箱与 GitHub，不含其他敏感个人信息。
