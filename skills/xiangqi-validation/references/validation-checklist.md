# Validation Checklist

## Rule Tests

- Legal and illegal moves for each piece type.
- Own-piece capture rejection.
- Self-check prevention.
- Check and checkmate detection.
- Captured king, resignation, timeout, and normal result data.
- Replay reconstruction from move history.
- Undo behavior when implemented or changed.
- Jieqi reveal behavior when implemented or changed.
- Gobang win detection when implemented or changed.

## UI Flow Checks

- Home loads directly into usable app experience.
- First-level pages preserve the current shell: mode rail or mobile nav, top title, scrollable content frame, and bottom tabs.
- Lobby entries either enter a game or provide clear unavailable feedback.
- Match dialog copy matches selected mode.
- Game timers and controls remain readable.
- Game intro, pause/menu, settings, chat, resign, and exit confirmation should not trap the player.
- Result handles 0-move and non-empty histories correctly.
- Replay controls step through available moves without board drift.
- Puzzle, Jieqi, flip chess, and Gobang minimum flows remain usable when touched.

## Responsive Checks

- Desktop 1280x720.
- Mobile 390x844.
- No horizontal scroll unless intentionally used for mode navigation.
- Text does not overlap icons, buttons, or board content.

## Build Checks

- `PATH=.tools/node/bin:$PATH .tools/node/bin/npm test`
- `PATH=.tools/node/bin:$PATH .tools/node/bin/npm run build`

Record skipped checks in the final implementation response.
