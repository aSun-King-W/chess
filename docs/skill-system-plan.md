# 象棋项目 Skill 体系最终计划

## Summary

当前项目先以网页版象棋为目标，不做小程序或 App。skill 采用“仓库内先维护，项目完成后再全局安装”的策略：项目推进中沉淀多个模块 skill，并把“阶段完成后更新 skill”作为固定收尾动作；等网页版完成、经验稳定后，再整合成一个高质量总 skill，让 AI 未来能自动生成类似象棋游戏。

本计划补强三块关键规则：触发/不触发标准、小改动处理分级、详细验收标准。目标是让仓库内 skill 体系可维护、可验证，并避免未来做扑克牌、麻将、普通网站等无关项目时误触发象棋 skill。

## Key Changes

- 在仓库内维护 skill 草稿，当前目录为 `skills/`。
- 先创建多模块 skill：
  - `xiangqi-web-director`：总控、项目边界、网页优先策略。
  - `xiangqi-rules-engine`：象棋规则、棋局模型、AI、复盘。
  - `xiangqi-web-ui`：网页 UI、首页、大厅、对局、结算、复盘、移动端。
  - `xiangqi-game-modes`：残局、揭棋、翻翻棋、五子棋等模式。
  - `xiangqi-validation`：测试、构建、浏览器验收、截图检查。
  - `xiangqi-scope-guardrails`：当前阶段的范围边界。
  - `xiangqi-skill-maintainer`：从对话、重复任务、阶段经验中提炼并更新 skill。
- 项目完成后，整合生成最终总 skill：`xiangqi-game-builder`，再安装到 `~/.codex/skills` 作为全局可复用能力。
- 新增触发矩阵、小改动分级和验收清单，作为后续细化实际 skill 文件的依据。

## Trigger Standards

### 总体原则

- 仓库内 skill 主要服务当前象棋网页项目，不要求自动触发。
- 未来全局 `xiangqi-game-builder` 必须只在中国象棋或高度相关的棋类游戏生成任务中触发。
- 如果用户请求是宽泛“棋类游戏”，但没有明确中国象棋，应先澄清或按当前上下文判断，不能默认套用象棋方案。
- 如果用户请求明显属于扑克牌、麻将、普通网站、后台系统或其他游戏类型，不应触发象棋 skill。

### 应触发的正例

这些请求应触发 `xiangqi-game-builder` 或对应模块 skill：

- “做一个网页版中国象棋游戏”
- “帮我实现象棋走子规则”
- “做一个天天象棋风格的大厅”
- “实现象棋复盘和棋谱回放”
- “给象棋游戏加残局模式”
- “做一个揭棋最小可玩版本”
- “优化中国象棋棋盘在手机上的布局”
- “给这个象棋项目补规则测试”
- “做一个 Xiangqi web game”
- “把当前象棋项目经验沉淀成 skill”

### 不应触发的反例

这些请求不应触发象棋 skill：

- “我要做一款扑克牌游戏”
- “做一个德州扑克 App”
- “实现斗地主规则”
- “做一个麻将游戏”
- “做一个国际象棋游戏”
- “做一个围棋 AI”
- “只做一个五子棋小游戏”
- “做一个 RPG 战斗系统”
- “做一个商城网站”
- “做一个后台管理系统”
- “做一个博客”
- “做一个股票看盘工具”

### 边界例

- “做一个棋类游戏”：先澄清具体棋种；如果当前上下文已经明确是中国象棋，可触发。
- “做一个下棋平台”：先澄清平台包含哪些棋种；如果包含中国象棋大厅，可触发 UI 或模式相关 skill。
- “做一个类似天天象棋的游戏”：可触发，因为“天天象棋”高度指向中国象棋体验。
- “做一个五子棋和象棋合集”：可触发，但只把象棋相关能力用于象棋模块，五子棋部分不能强行套象棋规则。
- “做一个棋牌大厅”：先澄清；如果是扑克牌/麻将为主，不触发象棋 skill。

### 模块 Skill 触发边界

- `xiangqi-rules-engine`：只因象棋规则、棋局模型、AI、复盘、计时、悔棋等逻辑触发。
- `xiangqi-web-ui`：只因当前象棋网页 UI、页面、弹窗、移动端、布局验收触发。
- `xiangqi-game-modes`：只因当前项目内的残局、揭棋、翻翻棋、五子棋模式触发。
- `xiangqi-validation`：只因测试、构建、浏览器验收、截图检查触发。
- `xiangqi-scope-guardrails`：只因范围漂移、跨端、后端、商业化、素材版权等判断触发。
- `xiangqi-skill-maintainer`：只因阶段完成、重复经验沉淀、skill 更新、skill 合并或最终全局化触发。

## Update Workflow

### 阶段开始

- 读取当前仓库、项目 docs 和相关模块 skill。
- 明确本阶段目标、范围和验收标准。
- 如果阶段涉及 skill 更新或最终总 skill，需要先检查触发标准是否会误伤无关项目。

### 阶段实施中

- 记录反复出现的用户偏好、实现坑、UI 判断、测试方法和验收流程。
- 候选经验先进入 `xiangqi-skill-maintainer` 的 inbox。
- 如果发现 skill 写成事实但当前源码不支持，应记录为待修正项。

### 阶段完成

- 主动检查是否有经验值得沉淀，不需要用户每次额外说“更新 skill”。
- 更新对应模块 skill。
- 将跨模块通用经验同步到 `xiangqi-web-director`。
- 清理 maintainer inbox，标记已吸收、暂不吸收或待观察内容。
- 对阶段结果做三选一记录：已更新 skill、进入 inbox、无需更新。

### 项目完成

- 从模块 skills、项目 docs、维护 inbox 中提炼最终总 skill。
- 总 skill 只保留稳定、可复用、可自动执行的经验。
- 安装到全局 `~/.codex/skills`，用于未来类似项目。
- 全局安装前必须跑完整触发矩阵，确认不会因扑克牌、麻将、普通网站等请求误触发。

## Small Change Handling

### 无需更新 Skill

以下改动默认不更新 skill，也不进入 inbox：

- 单次文案微调。
- 单个按钮颜色、间距、圆角、字号等样式微调。
- 一次性 bug 修复。
- 重命名局部变量。
- 移动少量代码但不改变架构或工作流。
- 补一个只服务当前页面的临时状态。
- 不影响工作流、偏好、验收标准或架构边界的改动。

### 进入 Maintainer Inbox

以下改动先进入 `xiangqi-skill-maintainer/inbox.md`，等待后续验证：

- 同类小改动重复出现 2 次以上。
- 用户反复纠正同一类偏好。
- 一个小修复暴露了潜在通用规则，但还没验证稳定。
- 某个 UI、测试、规则判断可能跨模块复用，但暂时还不确定。
- 某次验收发现了新风险，但还不确定是否需要长期规则。
- 某个计划目标和当前代码事实出现轻微不一致，需要后续确认。

### 更新模块 Skill

以下改动应更新对应模块 skill：

- 小改动最终形成稳定模式，比如“所有未开放入口必须 toast 或灰态”。
- 小改动改变了标准工作流，比如“阶段完成必须补触发矩阵”。
- 小改动影响验收口径，比如“0 手复盘必须禁用入口并显示空状态”。
- 小改动修正了之前 skill 里的不准确描述。
- 新测试方法被证明可复用。
- 新 UI 规则影响多个页面或多个状态。
- 新游戏逻辑规则影响 `src/game.ts`、测试和 UI 表现。

### 更新总控 Skill

以下改动应更新 `xiangqi-web-director`：

- 改动影响项目级方向、技术栈、范围边界、阶段流程或最终全局 skill 策略。
- 用户明确改变长期偏好。
- 某条规则跨多个模块都适用。
- 新增或移除一个模块 skill。
- 未来全局 `xiangqi-game-builder` 的触发边界发生变化。

## Repository Interfaces

仓库内每个 skill 使用接近正式 Codex skill 的结构：

```text
skills/
  xiangqi-web-director/
    SKILL.md
    references/
  xiangqi-rules-engine/
    SKILL.md
    references/
  xiangqi-web-ui/
    SKILL.md
    references/
  xiangqi-game-modes/
    SKILL.md
    references/
  xiangqi-validation/
    SKILL.md
    references/
  xiangqi-scope-guardrails/
    SKILL.md
  xiangqi-skill-maintainer/
    SKILL.md
    inbox.md
    references/
```

- `SKILL.md`：包含 `name`、`description`、核心工作流。
- `references/`：存放详细参考，比如阶段计划、页面观察、验收记录。
- `inbox.md`：仅维护 skill 使用，用来收集待沉淀经验。

当前仓库内 skill 不要求自动触发；它们主要作为项目内可读、可更新的技能草稿。最终全局 skill 安装后，才作为 Codex 可直接触发的正式能力包。

## Acceptance Standards

### 结构验收

- 每个 skill 都有 `SKILL.md`。
- 每个 `SKILL.md` 都有有效 `name` 和 `description`。
- 模块 skill 的 `description` 不过宽，不能让扑克牌、麻将、国际象棋等无关项目误触发。
- references 文件只放细节，不复制大量源码或过期计划。
- maintainer skill 必须有 inbox，用来管理 candidate、absorbed、deferred、rejected。

### 触发验收

- 建立触发矩阵，至少包含 10 个正例、10 个反例、5 个边界例。
- 每次调整总 skill 或模块 skill description 后，必须跑一遍触发矩阵人工检查。
- 反例中必须包含“我要做一款扑克牌游戏”，预期结果为不触发象棋 skill。
- 边界例必须说明是直接触发、拒绝触发，还是先澄清。
- 全局 `xiangqi-game-builder` 的触发描述必须比仓库内 skill 更窄。

### 内容真实性验收

- skill 中写成“当前事实”的内容必须能在源码、测试或 docs 中找到依据。
- 计划内容必须标记为目标、未来、deferred 或 completion-phase，不能写成已完成。
- 如果源码变化导致 skill 描述过期，阶段完成时必须更新或移入 inbox 待处理。
- 不把临时 TODO、一次性 bug、未验证想法写进长期 skill。
- 不复制大段源码到 skill；保留路径和工作流即可。

### 阶段维护验收

- 每个阶段完成时检查是否需要更新 skill。
- 检查结果必须落到三类之一：已更新、进入 inbox、无需更新。
- maintainer inbox 中的 candidate 不能长期堆积；阶段结束时要标记 absorbed、deferred、rejected 或继续 candidate。
- 若阶段引入新测试方法、验收流程或用户偏好，必须至少进入 inbox。
- 如果阶段改变触发边界，必须更新 Trigger Standards 或触发矩阵。

### 最终全局 Skill 验收

- `xiangqi-game-builder` 能独立指导 AI 完成网页版中国象棋项目。
- 它不会因扑克牌、斗地主、麻将、国际象棋、围棋、普通网站等请求误触发。
- 它能指导 AI 先澄清“棋类游戏”是否指中国象棋，而不是直接套用象棋方案。
- 它只包含稳定、验证过、可复用的经验，不包含临时 TODO 或半成品实现细节。
- 全局安装前，必须确认仓库内模块 skill 与最终总 skill 的职责边界清晰。

## Test Plan

### 文档级测试

- 检查 `docs/skill-system-plan.md` 是否包含：
  - `Trigger Standards`
  - `Small Change Handling`
  - `Acceptance Standards`
  - `Test Plan`
- 检查文档仍保留“仓库内先维护，项目完成后再全局安装”的方向。
- 检查不触发反例中明确包含“我要做一款扑克牌游戏”。

### 触发矩阵测试

- 正例应触发象棋相关 skill。
- 反例必须不触发象棋 skill。
- 边界例必须有明确处理方式：触发、拒绝或先澄清。
- 每次改动 skill `description` 后，应重新检查触发矩阵。

### 阶段完成测试

- 模拟一次阶段完成，确认能判断 skill 更新、inbox 记录或无需更新。
- 模拟一次小文案改动，确认不会污染 skill。
- 模拟一次反复出现的偏好，确认会进入 inbox 或更新模块 skill。
- 模拟一次触发边界变化，确认会更新触发标准或触发矩阵。

## Assumptions

- 这里的 skill 是给 AI 使用的自动化能力说明，不是游戏内玩家技能系统。
- 当前目标是网页版；小程序和 App 暂不纳入主路径。
- skill 不会后台静默自动更新；它会作为“阶段完成后的固定交付动作”主动维护。
- 先多模块沉淀，后期再合成一个总 skill。
- 现阶段不写入全局，避免半成品 skill 影响其他项目。
- “扑克牌游戏”等非中国象棋项目不应触发象棋 skill。
