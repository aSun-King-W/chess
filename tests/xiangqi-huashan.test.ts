import {
  XIANGQI_HUASHAN_TITLE,
  createHuashanChallengeSession,
  defaultHuashanSeasonStats,
  getHuashanHomeData,
  getHuashanReplayRows,
  getHuashanResultSummary,
  getHuashanSafePlaceholder,
  getHuashanSeasonProgress,
  getHuashanStage,
  getHuashanStages,
  getHuashanWinRate,
} from '../src/xiangqiHuashan.js';
import type {
  XiangqiHuashanChallengeSession,
  XiangqiHuashanStageId,
} from '../src/xiangqiHuashan.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function rowDetail(rows: Array<{ title: string; detail: string }>, title: string): string {
  const row = rows.find((item) => item.title === title);
  assert(row, `${title} row should exist`);
  return row.detail;
}

function assertTimeControl(
  session: XiangqiHuashanChallengeSession,
  totalMinutes: 10 | 15,
  regularStepSeconds: 60 | 90,
): void {
  assert(session.totalSeconds === totalMinutes * 60, `${session.id} total seconds`);
  assert(session.regularStepSeconds === regularStepSeconds, `${session.id} regular step seconds`);
  assert(session.openingMoveCount === 3, `${session.id} opening move count`);
  assert(session.openingStepSeconds === 30, `${session.id} opening step seconds`);
  assert(session.timeLabel === `${totalMinutes}分钟`, `${session.id} time label`);
  assert(session.stepLabel === `前3步30秒，之后${regularStepSeconds}秒`, `${session.id} step label`);
}

const expectedStages: XiangqiHuashanStageId[] = ['pass', 'summit'];

const tests: TestCase[] = [
  {
    name: '华山论剑首页数据包含赛季进度赛季榜赛制和安全占位',
    run: () => {
      const home = getHuashanHomeData('summit');

      assert(home.id === 'xiangqi-huashan', 'home id');
      assert(home.title === XIANGQI_HUASHAN_TITLE, 'home title');
      assert(home.seasonTitle === 'S3赛季', 'season title');
      assert(home.activeStage === 'summit', 'active stage');
      assert(home.stages.map((stage) => stage.id).join('/') === expectedStages.join('/'), 'stage order');
      assert(home.seasonProgress.progressLabel === '16/20 有效局', 'progress label');
      assert(home.seasonProgress.winRateLabel === '61%', 'win rate label');
      assert(home.seasonProgress.rankingLabel === '当前第 128 名', 'ranking label');
      assert(home.seasonProgress.streakLabel === '当前3连胜 / 最佳6连胜', 'streak label');
      assert(home.leaderboard.length >= 4, 'leaderboard rows');
      assert(home.leaderboard.some((row) => row.player === '我' && row.rank === 128), 'own leaderboard row');
      assert(home.safePlaceholders.length === 3, 'safe placeholder count');
      home.safePlaceholders.forEach((item) => {
        assert(item.available === false, `${item.id} should not be available`);
        assert(item.localOnly === true, `${item.id} should be local only`);
      });
    },
  },
  {
    name: '两种赛制暴露入口规则奖励和本地挑战局配置',
    run: () => {
      const stages = getHuashanStages();

      assert(stages.length === 2, 'two stages');
      const pass = getHuashanStage('pass');
      const summit = getHuashanStage('summit');

      assert(pass.title === '过关赛', 'pass title');
      assert(pass.entryLabel.includes('过关赛'), 'pass entry');
      assert(pass.settlementType === '闯关星数', 'pass settlement type');
      assert(pass.scoringLabel.includes('胜+3星'), 'pass scoring');
      assert(pass.timeControl.totalMinutes === 15, 'pass total minutes');
      assert(pass.timeControl.regularStepSeconds === 90, 'pass move seconds');
      assert(pass.challenge.validGameRequirement.includes('满20回合'), 'pass valid game tip');
      assert(pass.rules.some((rule) => rule.title === '连胜加成'), 'pass streak rule');
      assert(pass.rewards.some((reward) => reward.title === '闯关徽记'), 'pass reward');

      assert(summit.title === '山顶赛', 'summit title');
      assert(summit.entryLabel === '进入山顶赛', 'summit entry');
      assert(summit.settlementType === '山顶积分', 'summit settlement type');
      assert(summit.scoringLabel.includes('胜+18分'), 'summit scoring');
      assert(summit.timeControl.totalMinutes === 10, 'summit total minutes');
      assert(summit.timeControl.regularStepSeconds === 60, 'summit move seconds');
      assert(summit.challenge.validGameRequirement.includes('满30回合'), 'summit valid game tip');
      assert(summit.rules.some((rule) => rule.title === '排名'), 'summit ranking rule');
      assert(summit.rewards.some((reward) => reward.title === '山顶榜奖励'), 'summit reward');
    },
  },
  {
    name: '赛季进度可计算胜率连胜排名和有效局提示',
    run: () => {
      const progress = getHuashanSeasonProgress({
        played: 10,
        wins: 7,
        draws: 1,
        losses: 2,
        currentStreak: 3,
        bestStreak: 5,
        score: 1400,
        rank: 32,
        effectiveGames: 9,
      });

      assert(getHuashanWinRate(defaultHuashanSeasonStats) === 61, 'default win rate');
      assert(progress.winRate === 70, 'custom win rate');
      assert(progress.winRateLabel === '70%', 'custom win rate label');
      assert(progress.progressPercent === 45, 'progress percent');
      assert(progress.progressLabel === '9/20 有效局', 'progress label');
      assert(progress.rankingLabel === '当前第 32 名', 'ranking label');
      assert(progress.streakLabel === '当前3连胜 / 最佳5连胜', 'streak label');
      assert(progress.effectiveGameTip.includes('满20局'), 'effective game tip');
    },
  },
  {
    name: '真实观赛实时排行奖励领取只返回本地安全占位文案',
    run: () => {
      const spectating = getHuashanSafePlaceholder('spectating');
      const ranking = getHuashanSafePlaceholder('live-ranking');
      const reward = getHuashanSafePlaceholder('reward-claim');

      assert(spectating.message.includes('不连接直播对局'), 'spectating local text');
      assert(ranking.message.includes('固定赛季榜示例'), 'ranking local text');
      assert(reward.message.includes('不发放资产'), 'reward local text');
      assert(spectating.available === false && ranking.available === false && reward.available === false, 'not available');
      assert(spectating.localOnly === true && ranking.localOnly === true && reward.localOnly === true, 'local only');
    },
  },
  {
    name: '过关赛和山顶赛挑战 session 暴露结算复盘需要的核心信息',
    run: () => {
      const pass = createHuashanChallengeSession('pass', 2);
      const summit = createHuashanChallengeSession('summit', 8);

      assert(pass.moduleName === '华山论剑', 'pass module');
      assert(pass.arenaTitle === '过关赛', 'pass arena');
      assert(pass.tableLabel === '过关赛 2', 'pass table');
      assert(pass.settlementType === '闯关星数', 'pass settlement type');
      assert(pass.rewardLabel === '胜+3星 / 和+1星 / 负不加星', 'pass reward label');
      assert(pass.replayTags.includes('闯关星数结算'), 'pass replay settlement tag');
      assertTimeControl(pass, 15, 90);

      assert(summit.moduleName === '华山论剑', 'summit module');
      assert(summit.arenaTitle === '山顶赛', 'summit arena');
      assert(summit.tableLabel === '山顶赛 8', 'summit table');
      assert(summit.settlementType === '山顶积分', 'summit settlement type');
      assert(summit.rewardLabel === '胜+18分 / 和+3分 / 负-12分', 'summit reward label');
      assert(summit.replayTags.includes('山顶积分结算'), 'summit replay settlement tag');
      assertTimeControl(summit, 10, 60);
    },
  },
  {
    name: '结算摘要按赛制输出胜平负变化进度连胜排名和有效局提示',
    run: () => {
      const pass = createHuashanChallengeSession('pass');
      const passWin = getHuashanResultSummary(pass, 'win');
      const passDraw = getHuashanResultSummary(pass, 'draw');
      const passLoss = getHuashanResultSummary(pass, 'loss');

      assert(passWin.metricTitle === '闯关星数', 'pass metric');
      assert(passWin.delta === '+3', 'pass win delta');
      assert(passDraw.delta === '+1', 'pass draw delta');
      assert(passLoss.delta === '0', 'pass loss delta');
      assert(passWin.progressLabel === '17/20 有效局', 'pass progress after result');
      assert(passWin.streakLabel === '当前4连胜 / 最佳6连胜', 'pass streak after win');
      assert(passWin.rankLabel === '当前第 128 名', 'pass rank after win');
      assert(rowDetail(passWin.rows, '结算') === '胜+3星 / 和+1星 / 负不加星', 'pass row settlement');
      assert(rowDetail(passWin.rows, '有效局提示').includes('满20回合'), 'pass valid row');

      const summit = createHuashanChallengeSession('summit');
      const summitWin = getHuashanResultSummary(summit, 'win');
      const summitLoss = getHuashanResultSummary(summit, 'loss');

      assert(summitWin.metricTitle === '山顶积分', 'summit metric');
      assert(summitWin.delta === '+18', 'summit win delta');
      assert(summitLoss.delta === '-12', 'summit loss delta');
      assert(summitWin.rankLabel === '当前第 125 名', 'summit rank improves after win');
      assert(rowDetail(summitWin.rows, '赛制') === '山顶赛', 'summit row arena');
      assert(rowDetail(summitWin.rows, '结算类型') === '山顶积分', 'summit row settlement type');
      assert(rowDetail(summitWin.rows, '有效局提示').includes('满30回合'), 'summit valid row');
    },
  },
  {
    name: '复盘 rows 覆盖模块赛制桌号局时步时结算和有效局',
    run: () => {
      const passRows = getHuashanReplayRows(createHuashanChallengeSession('pass', 3));
      const summitRows = getHuashanReplayRows(createHuashanChallengeSession('summit', 5));

      assert(rowDetail(passRows, '模块') === '华山论剑', 'pass replay module');
      assert(rowDetail(passRows, '赛制') === '过关赛', 'pass replay stage');
      assert(rowDetail(passRows, '桌号') === '过关赛 3', 'pass replay table');
      assert(rowDetail(passRows, '局时') === '15分钟', 'pass replay time');
      assert(rowDetail(passRows, '步时') === '前3步30秒，之后90秒', 'pass replay step');
      assert(rowDetail(passRows, '结算类型') === '闯关星数', 'pass replay settlement type');
      assert(rowDetail(passRows, '有效局').includes('满20回合'), 'pass replay valid game');

      assert(rowDetail(summitRows, '模块') === '华山论剑', 'summit replay module');
      assert(rowDetail(summitRows, '赛制') === '山顶赛', 'summit replay stage');
      assert(rowDetail(summitRows, '桌号') === '山顶赛 5', 'summit replay table');
      assert(rowDetail(summitRows, '局时') === '10分钟', 'summit replay time');
      assert(rowDetail(summitRows, '步时') === '前3步30秒，之后60秒', 'summit replay step');
      assert(rowDetail(summitRows, '结算类型') === '山顶积分', 'summit replay settlement type');
      assert(rowDetail(summitRows, '有效局').includes('满30回合'), 'summit replay valid game');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
