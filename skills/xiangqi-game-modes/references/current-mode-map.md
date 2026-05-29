# Current Mode Map

## Xiangqi Lobby Entries

- Certification/rating/training/fast/standard/slow entries can enter local games.
- Activity or friend-room entries can enter local shells when modeled locally, or remain unavailable if they show clear toast feedback.
- Match dialog should reflect selected mode label, total time, and entry copy.
- Ranked can reuse the standard local match flow while showing ranked/season framing.

## Certification And Rating

- Certification data lives in `src/xiangqiCertification.ts`.
- Rating/evaluation data lives in `src/xiangqiRating.ts`.
- Keep rank/progress/rule summaries, dimension scoring, result rows, replay rows, and tags local.
- Do not add real user identity, account history, or server-side evaluation unless scope changes.

## Coin Arena And Minute Arena

- Coin arena data lives in `src/xiangqiCoinArena.ts`.
- Minute arena data lives in `src/xiangqiMinuteArena.ts`.
- Shared play-session mapping lives in `src/xiangqiPlaySession.ts`.
- Model resources, admissions, relief prompts, ticket/status rows, time controls, and settlement summaries locally.
- Coin/recharge/payment behavior must remain fake/local with disabled or explanatory feedback.

## Huashan

- Huashan data lives in `src/xiangqiHuashan.ts`.
- Preserve local stage configs, rules/rewards, leaderboard rows, season progress, challenge sessions, result summaries, replay rows, and safe placeholders.
- Spectating, live ranking, and reward claiming should not imply real backend behavior.

## Friend Room

- Friend-room data lives in `src/xiangqiFriendRoom.ts`.
- Preserve local room creation, duration modes, settlement rows, archive records, filtering, favorite toggles, and review info.
- Real invite/share/online room behavior should remain a safe placeholder until explicitly scoped.

## Puzzle

- Keep a simple local puzzle with a clear goal.
- Include reset, hint, timer/step display, and success/failure feedback.
- Hints may highlight a recommended target instead of providing a full engine explanation.
- The comment entry can remain a local modal with puzzle metadata and placeholder input.
- Extended puzzle flow lives in `src/xiangqiPuzzle.ts`; keep entry rows, stats, attempts, hints, settlement rows, replay rows, records, comments, and score calculation local and testable.
- Campaign-map flow is now part of the puzzle surface: preserve level locking, stamina, chapter/gate visuals, result overlay, and ranking panel as local state/data unless backend scope changes.

## Jieqi

- Hidden pieces should keep real side/kind/label internally.
- Legal moves should be generated from the real piece kind.
- First movement reveals the piece; revealed pieces keep their real label.
- The simplified local AI may respond by choosing legal black moves and revealing moved hidden pieces.
- Result copy should indicate Jieqi context when appropriate.
- Extended Jieqi arena and settlement flow lives in `src/xiangqiJieqi.ts`; keep admissions, capture stats, replay rows, placeholders, wallet constraints, and rating settlement local.
- Use a generated dark-piece back asset for hidden pieces when available; do not render hidden pieces as indistinct text-only chips.

## Flip Chess

- Minimum mode can use a compact dark-piece board.
- Click/tap should reveal pieces.
- Show framing such as avatars, resources, health, multiplier, and rules dialog.
- Current local logic lives in `src/xiangqiFlipChess.ts` and includes arenas, opening choice, reveal, move, capture, trophy sidebar, settlement, replay/record rows, and safe placeholders.
- Rules-guide artwork can be shown from `src/assets/more-games/flip-rules-guide.png`; keep it as explanatory local UI, not a backend/manual dependency.
- Full online arena behavior can be future work unless explicitly requested.

## Gobang

- Use a 15x15 board and local turn state.
- If AI is present, it should choose valid empty cells and honor selected difficulty.
- Difficulty-aware AI should win immediately when possible and block immediate player wins before weaker positional scoring.
- Preserve clear win detection and reset behavior.
- Current helper functions live in `src/game.ts`: `createGobangBoard`, `placeStone`, `chooseGobangMove`, and `hasGobangWin`.
