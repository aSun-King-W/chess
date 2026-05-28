import { dailyPuzzle } from '../src/puzzle.js';
import {
  createPuzzleProgress,
  getPuzzleDashboardStats,
  getPuzzleFeatureAction,
  puzzleFeatureEntries,
  puzzleTrainingSets,
  recordPuzzleAttempt,
} from '../src/puzzleLobby.js';
import type { PuzzleFeatureActionType } from '../src/puzzleLobby.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const tests: TestCase[] = [
  {
    name: '所有残局右侧入口都有本地动作且没有支付入口',
    run: () => {
      const progress = createPuzzleProgress();
      const allowedTypes: PuzzleFeatureActionType[] = [
        'open-daily',
        'open-set',
        'open-review',
        'open-ranking',
        'open-comments',
        'show-panel',
        'disabled',
      ];

      assert(puzzleFeatureEntries.length >= 9, 'lobby should expose a complete right panel model');
      for (const entry of puzzleFeatureEntries) {
        const action = getPuzzleFeatureAction(entry.id, progress);
        assert(allowedTypes.includes(action.type), `${entry.id} should return a supported action type`);
        assert(action.entryId === entry.id, `${entry.id} action should point back to the entry`);
        assert(entry.localOnly, `${entry.id} should be local-only`);
        assert(!entry.id.includes('pay') && !entry.title.includes('支付'), `${entry.id} should not expose payment`);
        assert(action.type !== 'disabled', `${entry.id} should be usable in local frontend`);
      }
    },
  },
  {
    name: '每日残局入口连接 dailyPuzzle 和每日训练集',
    run: () => {
      const action = getPuzzleFeatureAction('daily', createPuzzleProgress());
      assert(action.type === 'open-daily', 'daily entry should open daily puzzle');
      assert(action.puzzle === dailyPuzzle, 'daily entry should reuse dailyPuzzle object');
      assert(action.set?.id === 'daily-puzzle', 'daily entry should attach daily training set');
      assert(action.set.puzzleIds.includes(dailyPuzzle.id), 'daily training set should include dailyPuzzle id');
    },
  },
  {
    name: '训练集覆盖闯关、战术、杀法、错题和收藏',
    run: () => {
      const setIds = puzzleTrainingSets.map((set) => set.id);
      assert(setIds.includes('campaign-basic'), 'campaign set should exist');
      assert(setIds.includes('tactics-core'), 'tactics set should exist');
      assert(setIds.includes('mate-patterns'), 'mate pattern set should exist');
      assert(setIds.includes('mistake-review'), 'mistake review set should exist');
      assert(setIds.includes('favorite-review'), 'favorite review set should exist');
      assert(puzzleTrainingSets.every((set) => set.estimatedMinutes > 0), 'sets should be locally playable sessions');
    },
  },
  {
    name: 'recordPuzzleAttempt 更新完成、提示、用时、连胜和训练进度',
    run: () => {
      const progress = recordPuzzleAttempt(createPuzzleProgress(), {
        puzzleId: dailyPuzzle.id,
        outcome: 'solved',
        elapsedSeconds: 14,
        hintsUsed: 1,
        moves: 1,
        attemptedAt: '2026-05-28T00:00:00.000Z',
      });

      assert(progress.completedPuzzleIds.includes(dailyPuzzle.id), 'solved puzzle should be completed');
      assert(progress.totalAttempts === 1, 'attempts should increment');
      assert(progress.totalSolved === 1, 'solved count should increment');
      assert(progress.currentStreak === 1 && progress.bestStreak === 1, 'streak should increment');
      assert(progress.totalHintsUsed === 1, 'hint count should increment');
      assert(progress.totalElapsedSeconds === 14, 'elapsed seconds should be accumulated');
      assert(progress.fastestSolveSeconds === 14, 'fastest solve should be tracked');
      assert(progress.trainingSetProgress['daily-puzzle'].completed === 1, 'daily set progress should update');
      assert(progress.history[0].moves === 1, 'history should store move count');
    },
  },
  {
    name: 'recordPuzzleAttempt 更新失败、错题、断连胜，并可收藏',
    run: () => {
      const afterWin = recordPuzzleAttempt(createPuzzleProgress(), {
        puzzleId: dailyPuzzle.id,
        outcome: 'solved',
        elapsedSeconds: 9,
        hintsUsed: 0,
      });
      const progress = recordPuzzleAttempt(afterWin, {
        puzzleId: 'local-fork-trap-001',
        outcome: 'failed',
        elapsedSeconds: 31,
        hintsUsed: 2,
        moves: 3,
        favorited: true,
      });

      assert(progress.totalAttempts === 2, 'second attempt should be counted');
      assert(progress.totalFailed === 1, 'failed count should increment');
      assert(progress.failedPuzzleIds.includes('local-fork-trap-001'), 'failed puzzle id should be retained');
      assert(progress.mistakePuzzleIds.includes('local-fork-trap-001'), 'failed puzzle should enter mistakes');
      assert(progress.favoritePuzzleIds.includes('local-fork-trap-001'), 'favorited puzzle should enter favorites');
      assert(progress.currentStreak === 0, 'failed attempt should break current streak');
      assert(progress.bestStreak === 1, 'best streak should be preserved');
      assert(progress.totalHintsUsed === 2, 'failed attempt hints should be accumulated');
      assert(progress.totalElapsedSeconds === 40, 'failed attempt time should be accumulated');
    },
  },
  {
    name: '错题本和收藏题入口能从本地进度生成复习列表',
    run: () => {
      const progress = createPuzzleProgress({
        mistakePuzzleIds: ['local-cannon-net-002'],
        favoritePuzzleIds: [dailyPuzzle.id],
      });
      const mistakeAction = getPuzzleFeatureAction('mistakes', progress);
      const favoriteAction = getPuzzleFeatureAction('favorites', progress);

      assert(mistakeAction.type === 'open-review', 'mistakes should open review mode');
      assert(mistakeAction.set?.puzzleIds[0] === 'local-cannon-net-002', 'mistakes should use progress ids');
      assert(favoriteAction.type === 'open-review', 'favorites should open review mode');
      assert(favoriteAction.set?.puzzleIds[0] === dailyPuzzle.id, 'favorites should use progress ids');
    },
  },
  {
    name: '排行榜和评论是可展示的本地占位',
    run: () => {
      const progress = recordPuzzleAttempt(createPuzzleProgress(), {
        puzzleId: dailyPuzzle.id,
        outcome: 'solved',
        elapsedSeconds: 8,
      });
      const stats = getPuzzleDashboardStats(progress);
      const rankingAction = getPuzzleFeatureAction('ranking', progress);
      const commentsAction = getPuzzleFeatureAction('comments', progress);

      assert(rankingAction.type === 'open-ranking' && rankingAction.localPlaceholder, 'ranking should be local placeholder');
      assert(commentsAction.type === 'open-comments' && commentsAction.localPlaceholder, 'comments should be local placeholder');
      assert(stats.localRanking.length >= 3, 'dashboard should include local ranking rows');
      assert(stats.localRanking[0].name === '你', 'local ranking should put player first');
      assert(stats.commentPreview.length > 0, 'dashboard should include local comment previews');
      assert(stats.commentPreview.every((comment) => comment.localOnly), 'comments should be explicitly local');
      assert(stats.dailyPuzzleId === dailyPuzzle.id, 'dashboard should keep daily puzzle id');
    },
  },
  {
    name: '提示复盘和重来入口使用 show-panel 动作',
    run: () => {
      const progress = createPuzzleProgress();
      const analysisAction = getPuzzleFeatureAction('analysis', progress);
      const restartAction = getPuzzleFeatureAction('restart', progress);

      assert(analysisAction.type === 'show-panel' && analysisAction.panel === 'analysis', 'analysis should open panel');
      assert(restartAction.type === 'show-panel' && restartAction.panel === 'restart', 'restart should open panel');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
