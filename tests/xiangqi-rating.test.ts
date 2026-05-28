import {
  getRatingDimensions,
  getRatingEntryRows,
  getRatingSessionRows,
  settleXiangqiRating,
  xiangqiRatingConfig,
} from '../src/xiangqiRating.js';
import type {
  XiangqiRatingDimensionId,
  XiangqiRatingEntryRow,
  XiangqiRatingReviewRow,
  XiangqiRatingScoreInput,
  XiangqiRatingSessionRow,
} from '../src/xiangqiRating.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function entryValue(rows: XiangqiRatingEntryRow[], id: string): string {
  const row = rows.find((item) => item.id === id);
  assert(row, `${id} entry row should exist`);
  return row.value;
}

function sessionDetail(rows: XiangqiRatingSessionRow[], id: string): string {
  const row = rows.find((item) => item.id === id);
  assert(row, `${id} session row should exist`);
  return row.detail;
}

function replayDetail(rows: XiangqiRatingReviewRow[], title: string): string {
  const row = rows.find((item) => item.title === title);
  assert(row, `${title} replay row should exist`);
  return row.detail;
}

const balancedScores: XiangqiRatingScoreInput[] = [
  { dimensionId: 'opening', score: 82 },
  { dimensionId: 'middlegame', score: 76 },
  { dimensionId: 'endgame', score: 68 },
  { dimensionId: 'blunder', score: 58 },
  { dimensionId: 'sacrifice', score: 63 },
  { dimensionId: 'mateConversion', score: 88 },
];

const expectedDimensions: XiangqiRatingDimensionId[] = [
  'opening',
  'middlegame',
  'endgame',
  'blunder',
  'sacrifice',
  'mateConversion',
];

const tests: TestCase[] = [
  {
    name: '棋力评测配置固定15分钟90秒步时前三步30秒',
    run: () => {
      const { timeControl } = xiangqiRatingConfig;
      const entryRows = getRatingEntryRows();
      const sessionRows = getRatingSessionRows();

      assert(xiangqiRatingConfig.title === '棋力评测', 'title should be rating evaluation');
      assert(timeControl.totalMinutes === 15, 'total minutes');
      assert(timeControl.stepSeconds === 90, 'step seconds');
      assert(timeControl.openingMoveCount === 3, 'opening move count');
      assert(timeControl.openingStepSeconds === 30, 'opening step seconds');
      assert(timeControl.label.includes('局时15分钟'), 'time label should mention total minutes');
      assert(timeControl.label.includes('步时90秒'), 'time label should mention step seconds');
      assert(timeControl.label.includes('前3步30秒'), 'time label should mention opening step seconds');
      assert(entryValue(entryRows, 'time-control') === timeControl.label, 'entry rows expose time control');
      assert(sessionDetail(sessionRows, 'time-control') === timeControl.label, 'session rows expose time control');
    },
  },
  {
    name: '入口和本场说明 rows 暴露结算类型维度和说明文案',
    run: () => {
      const entryRows = getRatingEntryRows();
      const sessionRows = getRatingSessionRows();
      const dimensionText = entryValue(entryRows, 'dimensions');
      const description = sessionDetail(sessionRows, 'description');

      assert(entryValue(entryRows, 'module') === '棋力评测', 'module entry row');
      assert(entryValue(entryRows, 'settlement') === '评测分', 'settlement entry row');
      assert(entryValue(entryRows, 'entry-resource') === '免费评测', 'entry resource row');
      assert(description.includes('15分钟') && description.includes('90秒') && description.includes('前3步30秒'), 'session description time control');
      assert(description.includes('能力维度') && description.includes('评测分'), 'session description settlement');
      expectedDimensions.forEach((dimensionId) => {
        const dimension = xiangqiRatingConfig.dimensions.find((item) => item.id === dimensionId);
        assert(dimension, `${dimensionId} dimension config`);
        assert(dimensionText.includes(dimension.title), `${dimensionId} entry dimension`);
      });
    },
  },
  {
    name: '能力维度完整覆盖开局中局残局漏着送子将杀把握',
    run: () => {
      const dimensions = getRatingDimensions();

      assert(dimensions.length === 6, 'six dimensions');
      assert(dimensions.map((dimension) => dimension.id).join('/') === expectedDimensions.join('/'), 'dimension ids');
      dimensions.forEach((dimension) => {
        assert(dimension.maxScore === 100, `${dimension.id} max score`);
        assert(dimension.description.length > 0, `${dimension.id} description`);
        assert(dimension.reviewLabel.length > 0, `${dimension.id} review label`);
        assert(dimension.suggestion.length > 0, `${dimension.id} suggestion`);
      });
    },
  },
  {
    name: '结算产出评测分维度等级最强最弱和训练建议',
    run: () => {
      const settlement = settleXiangqiRating('win', balancedScores);

      assert(settlement.outcome === 'win', 'outcome');
      assert(settlement.ratingScore === 85, 'rating score should combine average score and win delta');
      assert(settlement.ratingDelta === '+25', 'rating delta');
      assert(settlement.progressLabel === '95/100', 'progress label');
      assert(settlement.dimensionResults.length === 6, 'dimension results');
      assert(settlement.strongestDimension.id === 'mateConversion', 'strongest dimension');
      assert(settlement.weakestDimension.id === 'blunder', 'weakest dimension');
      assert(settlement.dimensionResults.find((item) => item.id === 'mateConversion')?.grade === 'excellent', 'excellent grade');
      assert(settlement.dimensionResults.find((item) => item.id === 'opening')?.grade === 'stable', 'stable grade');
      assert(settlement.dimensionResults.find((item) => item.id === 'blunder')?.grade === 'needs-practice', 'needs practice grade');
      assert(settlement.trainingSuggestions.length >= 1, 'training suggestions');
      assert(settlement.trainingSuggestions.join('\n').includes('漏着'), 'training suggestions should include weakest dimension');
      assert(settlement.trainingSuggestions.join('\n').includes('送子'), 'training suggestions should include weak sacrifice dimension');
    },
  },
  {
    name: '复盘信息 rows 包含模块场次局时结算评测分维度和训练建议',
    run: () => {
      const settlement = settleXiangqiRating('loss', balancedScores);
      const rows = settlement.replayRows;
      const dimensions = replayDetail(rows, '能力维度');

      assert(replayDetail(rows, '模块') === '棋力评测', 'replay module');
      assert(replayDetail(rows, '场次') === '15分钟评测局', 'replay arena');
      assert(replayDetail(rows, '局时') === xiangqiRatingConfig.timeControl.label, 'replay time control');
      assert(replayDetail(rows, '结算类型') === '评测分', 'replay settlement type');
      assert(replayDetail(rows, '评测分') === '65 (+5)', 'replay rating score');
      assert(dimensions.includes('开局82'), 'replay opening score');
      assert(dimensions.includes('将杀把握88'), 'replay mate conversion score');
      assert(replayDetail(rows, '训练建议').includes('漏着'), 'replay training suggestion');
    },
  },
  {
    name: '维度分会被规整到0到100并支持和棋结算',
    run: () => {
      const settlement = settleXiangqiRating('draw', [
        { dimensionId: 'opening', score: 120 },
        { dimensionId: 'middlegame', score: 74.4 },
        { dimensionId: 'endgame', score: -10 },
        { dimensionId: 'blunder', score: 70 },
        { dimensionId: 'sacrifice', score: 70 },
        { dimensionId: 'mateConversion', score: 70 },
      ]);

      assert(settlement.dimensionResults.find((item) => item.id === 'opening')?.score === 100, 'score upper clamp');
      assert(settlement.dimensionResults.find((item) => item.id === 'middlegame')?.score === 74, 'score rounding');
      assert(settlement.dimensionResults.find((item) => item.id === 'endgame')?.score === 0, 'score lower clamp');
      assert(settlement.ratingScore === 66, 'draw rating score');
      assert(settlement.ratingDelta === '+6', 'draw rating delta');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
