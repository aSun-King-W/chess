# Current Mode Map

## Xiangqi Lobby Entries

- Certification/rating/training/fast/standard/slow entries can enter local games.
- Activity or friend-room entries can remain unavailable if they show clear toast feedback.
- Match dialog should reflect selected mode label, total time, and entry copy.
- Ranked can reuse the standard local match flow while showing ranked/season framing.

## Puzzle

- Keep a simple local puzzle with a clear goal.
- Include reset, hint, timer/step display, and success/failure feedback.
- Hints may highlight a recommended target instead of providing a full engine explanation.
- The comment entry can remain a local modal with puzzle metadata and placeholder input.

## Jieqi

- Hidden pieces should keep real side/kind/label internally.
- Legal moves should be generated from the real piece kind.
- First movement reveals the piece; revealed pieces keep their real label.
- The simplified local AI may respond by choosing legal black moves and revealing moved hidden pieces.
- Result copy should indicate Jieqi context when appropriate.

## Flip Chess

- Minimum mode can use a compact dark-piece board.
- Click/tap should reveal pieces.
- Show framing such as avatars, resources, health, multiplier, and rules dialog.
- Full capture rules and complete victory logic can be future work unless explicitly requested.

## Gobang

- Use a compact board and local turn state.
- If AI is present, it should choose valid empty cells.
- Preserve clear win detection and reset behavior.
- Current helper functions live in `src/game.ts`: `createGobangBoard`, `placeStone`, `chooseGobangMove`, and `hasGobangWin`.
