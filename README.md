# 天天象棋网页版复刻

基于 `React + TypeScript + Vite` 的天天象棋风格网页项目。当前版本已经覆盖象棋大厅、玩法入口、对局页、结算页、复盘页、我的页，以及象棋、揭棋、残局、翻翻棋、五子棋等模式的本地化体验外壳和核心规则验证。

项目重点是复刻移动端天天象棋的主要信息架构、玩法入口、局内交互和结算复盘流程。所有支付、商城、邀请、观赛、排行榜等联网能力目前只做本地安全占位，不会触发真实支付或外部账号行为。

## 当前能力

- 象棋核心规则：走子合法性、将军、将死、困毙、悔棋、计时、复盘和胜负结算。
- AI 走子：内置本地搜索兜底，并可在浏览器中加载 Pikafish WebAssembly 强引擎。
- 揭棋模式：暗子身份、首次移动翻明、揭棋走法、场次配置、结算和复盘信息。
- 残局模式：每日残局、闯关、多步解法、提示、悔棋、重来、评论和学习入口。
- 翻翻棋模式：抢红、翻子、倍率、吃子规则、强退/超时风险、战利品和结算记录。
- 大厅与玩法入口：棋力评测、铜钱场、分钟场、棋力认证、华山论剑、好友房和更多模式入口。
- 测试覆盖：规则引擎、强引擎适配、各模式配置、结算摘要、复盘 rows 和安全占位行为。

## 技术栈

- React 19
- TypeScript
- Vite
- lucide-react
- Pikafish WebAssembly 引擎资源

## 本地运行

项目真实路径：

```text
/Users/meteor/Documents/chess
```

如果你的电脑已经安装了 Node.js 和 npm，可以直接运行：

```bash
cd /Users/meteor/Documents/chess
npm install
npm run dev
```

如果使用项目目录里的本地 Node/npm，请先把它加入当前终端的 `PATH`：

```bash
cd /Users/meteor/Documents/chess
export PATH="$PWD/.tools/node/bin:$PATH"
npm install
npm run dev
```

启动后打开终端里显示的地址，通常是：

```text
http://localhost:5173/
```

注意：不要直接在项目外运行 `.tools/node/bin/npm`。`npm` 需要通过 `PATH` 找到同目录里的 `node`，否则可能出现 `env: node: No such file or directory`。

## 常用命令

开发服务器：

```bash
npm run dev
```

生产构建：

```bash
npm run build
```

完整规则回归测试：

```bash
npm test
```

预览生产构建：

```bash
npm run preview
```

如果使用本地 `.tools/node`，每次新开终端先执行：

```bash
export PATH="/Users/meteor/Documents/chess/.tools/node/bin:$PATH"
```

## 项目结构

```text
src/
  App.tsx                 主应用、页面状态和主要交互
  game.ts                 标准象棋规则与基础 AI
  xiangqiEngine.ts        Pikafish/FEN/UCI 适配和本地搜索兜底
  jieqi.ts                揭棋规则
  puzzle.ts               残局题库和残局会话逻辑
  xiangqiFlipChess.ts     翻翻棋规则
  xiangqi*.ts             象棋大厅、场次、评测、好友房等模式模型
  assets/                 背景、棋子、图标、字体和玩法素材

public/
  pikafish-engine-worker.js
  engines/pikafish/       Pikafish WebAssembly 运行资源

tests/
  *.test.ts               规则、模式、入口、结算和复盘测试

skills/
  xiangqi-*/              项目维护用技能说明和模块地图

docs/
  *.md                    实施计划、观察记录和验证文档
```

## 强引擎说明

`public/engines/pikafish` 中包含可选的 Pikafish WebAssembly 引擎资源。浏览器运行时会通过 `/pikafish-engine-worker.js` 与引擎通信，发送 UCI 命令并读取 `bestmove`。

如果引擎缺失、加载失败、超时或返回非法步，项目会自动回退到本地启发式搜索 AI，保证对局仍能继续。

Pikafish 是 GPL-3.0 软件。引擎资源来源和上游链接记录在：

```text
public/engines/pikafish/README.md
```

## 开发备注

- `.tools/`、`node_modules/`、`dist/` 和测试编译产物不会提交到 Git。
- 当前项目是本地网页复刻，不包含真实登录、支付、联网匹配或账号资产结算。
- 修改规则或玩法配置后，优先运行 `npm test`；修改 UI 或资源后，再运行 `npm run build` 做生产构建检查。
