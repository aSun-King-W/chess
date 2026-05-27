# Trigger Matrix

Use this matrix when updating skill descriptions or preparing the future global `xiangqi-game-builder` skill. The goal is to keep Xiangqi guidance from triggering for unrelated projects.

## Expected Trigger

These requests should trigger the future global `xiangqi-game-builder` or the relevant repository-local module skill.

| Request | Expected handling |
| --- | --- |
| 做一个网页版中国象棋游戏 | Trigger Xiangqi game builder/director |
| 帮我实现象棋走子规则 | Trigger rules engine |
| 做一个天天象棋风格的大厅 | Trigger web UI/director |
| 实现象棋复盘和棋谱回放 | Trigger rules engine and UI as needed |
| 给象棋游戏加残局模式 | Trigger game modes |
| 做一个揭棋最小可玩版本 | Trigger game modes |
| 优化中国象棋棋盘在手机上的布局 | Trigger web UI and validation |
| 给这个象棋项目补规则测试 | Trigger validation and rules engine |
| 做一个 Xiangqi web game | Trigger Xiangqi game builder/director |
| 把当前象棋项目经验沉淀成 skill | Trigger skill maintainer |

## Expected Non-Trigger

These requests should not trigger Xiangqi skills.

| Request | Expected handling |
| --- | --- |
| 我要做一款扑克牌游戏 | Do not trigger Xiangqi skills |
| 做一个德州扑克 App | Do not trigger Xiangqi skills |
| 实现斗地主规则 | Do not trigger Xiangqi skills |
| 做一个麻将游戏 | Do not trigger Xiangqi skills |
| 做一个国际象棋游戏 | Do not trigger Xiangqi skills |
| 做一个围棋 AI | Do not trigger Xiangqi skills |
| 只做一个五子棋小游戏 | Do not trigger Xiangqi game builder |
| 做一个 RPG 战斗系统 | Do not trigger Xiangqi skills |
| 做一个商城网站 | Do not trigger Xiangqi skills |
| 做一个后台管理系统 | Do not trigger Xiangqi skills |
| 做一个博客 | Do not trigger Xiangqi skills |
| 做一个股票看盘工具 | Do not trigger Xiangqi skills |

## Boundary Cases

| Request | Expected handling |
| --- | --- |
| 做一个棋类游戏 | Clarify the chess type unless context already says Xiangqi |
| 做一个下棋平台 | Clarify included game types; trigger only for Xiangqi parts |
| 做一个类似天天象棋的游戏 | Trigger, because the product reference points to Xiangqi |
| 做一个五子棋和象棋合集 | Trigger for Xiangqi modules only; do not apply Xiangqi rules to Gobang |
| 做一个棋牌大厅 | Clarify; do not trigger if card/Mahjong focused |

## Manual Check Procedure

1. Read the changed `description` fields.
2. Compare them against all rows above.
3. Confirm positive examples would be selected.
4. Confirm non-trigger examples would not be selected.
5. For boundary examples, confirm the skill tells the agent to clarify or scope to Xiangqi only.
