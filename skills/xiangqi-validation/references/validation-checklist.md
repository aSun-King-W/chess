# Validation Checklist

## Rule Tests

- Legal and illegal moves for each piece type.
- Own-piece capture rejection.
- Self-check prevention.
- Check and checkmate detection.
- Stalemate/困毙 detection and result reason.
- Captured king, resignation, timeout, and normal result data.
- Replay reconstruction from move history.
- FEN/UCI conversion, engine bestmove validation, difficulty behavior, timeout/failure fallback, and local search evaluation when engine code changes.
- Undo behavior when implemented or changed.
- Jieqi reveal behavior when implemented or changed.
- Puzzle attempt, hint, scoring, record, comment, and settlement helpers when implemented or changed.
- Flip chess reveal, opening choice, capture hierarchy, trophy, settlement, and safe placeholder helpers when implemented or changed.
- Coin arena, minute arena, certification, rating, Huashan, friend-room, and shared play-session helpers when their rows/admissions/results/archives change.
- Gobang difficulty, immediate win/block choice, and win detection when implemented or changed.

## UI Flow Checks

- Home loads directly into usable app experience.
- First-level pages preserve the current shell: mode rail or mobile nav, top title, scrollable content frame, and bottom tabs.
- Lobby entries either enter a game or provide clear unavailable feedback.
- Match dialog copy matches selected mode.
- Game timers and controls remain readable.
- Game intro, pause/menu, settings, chat, resign, and exit confirmation should not trap the player.
- Result handles 0-move and non-empty histories correctly.
- Replay controls step through available moves without board drift.
- Puzzle campaign, daily puzzle, Jieqi, flip chess, Gobang difficulty, certification/rating, coin/minute arenas, Huashan, and friend-room local flows remain usable when touched.
- Generated piece, board, mode-icon, and hidden-piece-back assets render legibly at desktop and mobile board/card sizes when asset usage changes.
- Optional engine path must still let the user play when Pikafish worker/assets are unavailable.

## Responsive Checks

- Desktop 1280x720.
- Mobile 390x844.
- No horizontal scroll unless intentionally used for mode navigation.
- Text does not overlap icons, buttons, or board content.

## Build Checks

- `PATH=.tools/node/bin:$PATH .tools/node/bin/npm test`
- `PATH=.tools/node/bin:$PATH .tools/node/bin/npm run build`

Record skipped checks in the final implementation response.
