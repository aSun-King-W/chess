# 天天象棋网页版复刻

基于 `React + TypeScript + Vite` 的网页初始版本。阶段一至四已建立主导航、资源栏、玩法入口、象棋大厅、对局页、结算页、复盘页、我的页和其他模式外壳，并接入本地象棋核心玩法。阶段五已补充规则回归测试、浏览器路径验收、焦点与文字溢出打磨，以及更稳的基础 AI 走子评分。

## 本地启动

当前项目已在 `.tools/node` 放置本地 Node/npm，不依赖系统 npm。启动前先进入项目目录：

```bash
cd /Users/meteor/Documents/chess
PATH=.tools/node/bin:$PATH .tools/node/bin/npm install
PATH=.tools/node/bin:$PATH .tools/node/bin/npm run dev
```

生产构建：

```bash
PATH=.tools/node/bin:$PATH .tools/node/bin/npm run build
```

规则回归测试：

```bash
PATH=.tools/node/bin:$PATH .tools/node/bin/npm test
```

项目真实路径为：

```text
/Users/meteor/Documents/chess
```

桌面上的 `chess` 是指向真实路径的快捷入口。
