import {
  createCertificationPlaySession,
  createCoinPlaySession,
  createFriendPlaySession,
  createMinutePlaySession,
  createHuashanPlaySession,
  createRatingPlaySession,
  getPlaySessionReplayRows,
  getPlaySessionResultSummary,
} from '../src/xiangqiPlaySession.js';
import type { XiangqiPlaySession } from '../src/xiangqiPlaySession.js';
import type { XiangqiMinuteArenaMode } from '../src/xiangqiMinuteArena.js';

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
  session: XiangqiPlaySession,
  totalMinutes: number,
  regularStepSeconds: number,
  openingStepSeconds: number,
): void {
  assert(session.totalSeconds === totalMinutes * 60, `${session.id} total seconds`);
  assert(session.regularStepSeconds === regularStepSeconds, `${session.id} regular step seconds`);
  assert(session.openingMoveCount === 3, `${session.id} opening move count`);
  assert(session.openingStepSeconds === openingStepSeconds, `${session.id} opening step seconds`);
  assert(session.timeLabel === `${totalMinutes}分钟`, `${session.id} time label`);
  assert(
    session.stepLabel === `前3步${openingStepSeconds}秒，之后${regularStepSeconds}秒`,
    `${session.id} step label`,
  );
}

function assertReplayRows(
  session: XiangqiPlaySession,
  moduleName: string,
  arenaTitle: string,
  settlementType: string,
): void {
  const rows = getPlaySessionReplayRows(session);

  assert(rowDetail(rows, '模块') === moduleName, `${session.id} replay module`);
  assert(rowDetail(rows, '场次') === arenaTitle, `${session.id} replay arena`);
  assert(rowDetail(rows, '局时') === session.timeLabel, `${session.id} replay time`);
  assert(rowDetail(rows, '结算类型') === settlementType, `${session.id} replay settlement type`);
  assert(rowDetail(rows, '结算') === session.rewardLabel, `${session.id} replay settlement`);
}

const minuteModes: Array<{ mode: XiangqiMinuteArenaMode; minutes: 5 | 10 | 20; title: string }> = [
  { mode: 'five-minute', minutes: 5, title: '五分钟' },
  { mode: 'ten-minute', minutes: 10, title: '十分钟' },
  { mode: 'twenty-minute', minutes: 20, title: '二十分钟' },
];

const tests: TestCase[] = [
  {
    name: '认证场选择后生成15分钟90秒步时前三步30秒的 session',
    run: () => {
      const session = createCertificationPlaySession(6);

      assert(session.kind === 'certification', 'certification kind');
      assert(session.matchMode === 'certification', 'certification match mode');
      assert(session.moduleName === '棋力认证', 'certification module');
      assert(session.tableLabel === '认证席 6', 'certification table');
      assert(session.ticketLabel === '2500/次', 'certification ticket');
      assert(session.settlementType === '棋力分', 'certification settlement type');
      assertTimeControl(session, 15, 90, 30);
      assert(session.replayTags.includes('棋力认证'), 'certification replay tag module');
      assert(session.replayTags.includes('棋力分结算'), 'certification replay tag settlement');
    },
  },
  {
    name: '铜钱随机场选择后生成8分钟60秒步时前三步90秒和门票配置',
    run: () => {
      const session = createCoinPlaySession('random', { gold: 0, silver: 8330 }, 2);

      assert(session.kind === 'coin', 'coin kind');
      assert(session.matchMode === 'coinRandom', 'coin random match mode');
      assert(session.moduleName === '铜钱场', 'coin module');
      assert(session.arenaTitle === '随机场', 'coin random arena');
      assert(session.tableLabel === '铜钱桌 2', 'coin random table');
      assert(session.ticketLabel === '门票1000铜钱', 'coin random ticket');
      assert(session.settlementType === '铜钱', 'coin random settlement type');
      assertTimeControl(session, 8, 60, 90);
      assert(session.replayTags.includes('铜钱场'), 'coin random replay tag module');
      assert(session.replayTags.includes('铜钱结算'), 'coin random replay tag settlement');
    },
  },
  {
    name: '积分场三种分钟模式选择后生成固定60秒步时前三步30秒和2500铜钱门票',
    run: () => {
      minuteModes.forEach(({ mode, minutes, title }) => {
        const session = createMinutePlaySession(mode, minutes);

        assert(session.kind === 'minute', `${mode} kind`);
        assert(session.moduleName === '积分场', `${mode} module`);
        assert(session.arenaTitle === title, `${mode} title`);
        assert(session.tableLabel === `积分桌 ${minutes}`, `${mode} table`);
        assert(session.ticketLabel === '门票 2500 铜钱', `${mode} ticket`);
        assert(session.settlementType === '积分', `${mode} settlement type`);
        assertTimeControl(session, minutes, 60, 30);
        assert(session.replayTags.includes('积分场'), `${mode} replay tag module`);
        assert(session.replayTags.includes('积分结算'), `${mode} replay tag settlement`);
      });
    },
  },
  {
    name: '棋力评测华山好友三类新增 session 写入独立参数',
    run: () => {
      const rating = createRatingPlaySession(4);
      assert(rating.kind === 'rating', 'rating kind');
      assert(rating.matchMode === 'rating', 'rating match mode');
      assert(rating.moduleName === '棋力评测', 'rating module');
      assert(rating.tableLabel === '评测桌 4', 'rating table');
      assert(rating.ticketLabel === '免费评测', 'rating ticket');
      assert(rating.settlementType === '评测分', 'rating settlement');
      assertTimeControl(rating, 15, 90, 30);
      assert(rating.replayTags.includes('评测结算'), 'rating replay settlement');

      const huashan = createHuashanPlaySession('summit', 8);
      assert(huashan.kind === 'huashan', 'huashan kind');
      assert(huashan.matchMode === 'huashan', 'huashan match mode');
      assert(huashan.moduleName === '华山论剑', 'huashan module');
      assert(huashan.arenaTitle === '山顶赛', 'huashan arena');
      assert(huashan.tableLabel === '华山台 8', 'huashan table');
      assert(huashan.settlementType === '活动成绩', 'huashan settlement');
      assertTimeControl(huashan, 10, 60, 30);
      assert(huashan.replayTags.includes('活动结算'), 'huashan replay settlement');

      const friend = createFriendPlaySession('twenty-minute', 5);
      assert(friend.kind === 'friend', 'friend kind');
      assert(friend.matchMode === 'friend', 'friend match mode');
      assert(friend.moduleName === '好友对战', 'friend module');
      assert(friend.arenaTitle === '20分钟好友房', 'friend arena');
      assert(friend.tableLabel.includes('C'), 'friend club label');
      assert(friend.settlementType === '好友局', 'friend settlement');
      assert(friend.rewardLabel.includes('不计分'), 'friend reward');
      assertTimeControl(friend, 20, 60, 30);
      assert(friend.replayTags.includes('好友对战'), 'friend replay module');
    },
  },
  {
    name: '认证铜钱积分评测华山好友结果摘要暴露结算文案和胜负数值变化',
    run: () => {
      const certification = createCertificationPlaySession();
      const certificationWin = getPlaySessionResultSummary(certification, true);
      const certificationLoss = getPlaySessionResultSummary(certification, false);
      assert(certificationWin.metricTitle === '棋力分变化', 'certification metric');
      assert(certificationWin.delta === '+15', 'certification win delta');
      assert(certificationLoss.delta === '-15', 'certification loss delta');
      assert(rowDetail(certificationWin.rows, '结算类型') === '棋力分', 'certification summary settlement type');
      assert(rowDetail(certificationWin.rows, '结算') === '输赢仅计算棋力分', 'certification summary settlement');
      assert(certificationWin.progressLabel === '100/110', 'certification win progress');
      assert(certificationLoss.progressLabel === '85/100', 'certification loss progress');

      const coinRandom = createCoinPlaySession('random', { gold: 0, silver: 8330 });
      const coinRandomWin = getPlaySessionResultSummary(coinRandom, true);
      const coinRandomLoss = getPlaySessionResultSummary(coinRandom, false);
      assert(coinRandomWin.metricTitle === '铜钱变化', 'coin random metric');
      assert(coinRandomWin.delta === '+5000', 'coin random win delta');
      assert(coinRandomLoss.delta === '-5000', 'coin random loss delta');
      assert(rowDetail(coinRandomWin.rows, '门票') === '门票1000铜钱', 'coin random summary ticket');
      assert(rowDetail(coinRandomWin.rows, '结算') === '单局输赢5000铜钱', 'coin random settlement');
      assert(coinRandomWin.progressLabel === '余额 13330', 'coin random win balance');
      assert(coinRandomLoss.progressLabel === '余额 3330', 'coin random loss balance');

      const coinBonus = createCoinPlaySession('five-middle', { gold: 0, silver: 50000 });
      assert(coinBonus.winDelta === '+23000', 'coin bonus win delta should include 15 percent bonus');
      assert(coinBonus.lossDelta === '-20000', 'coin bonus loss delta should use base stake');
      assert(coinBonus.rewardLabel.includes('胜局加成+15%'), 'coin bonus reward label');

      const minute = createMinutePlaySession('ten-minute');
      const minuteWin = getPlaySessionResultSummary(minute, true);
      const minuteLoss = getPlaySessionResultSummary(minute, false);
      assert(minuteWin.metricTitle === '积分变化', 'minute metric');
      assert(minuteWin.delta === '+12', 'minute win delta');
      assert(minuteLoss.delta === '-12', 'minute loss delta');
      assert(rowDetail(minuteWin.rows, '结算类型') === '积分', 'minute summary settlement type');
      assert(rowDetail(minuteWin.rows, '结算') === '胜负影响积分与头衔', 'minute summary settlement');
      assert(minuteWin.progressLabel === '54/100', 'minute win progress');
      assert(minuteLoss.progressLabel === '30/100', 'minute loss progress');

      const rating = getPlaySessionResultSummary(createRatingPlaySession(), true);
      assert(rating.metricTitle === '评测分变化', 'rating metric');
      assert(rating.delta === '+25', 'rating delta');
      assert(rowDetail(rating.rows, '结算类型') === '评测分', 'rating settlement type');
      assert(rowDetail(rating.rows, '开局').includes('分'), 'rating dimension row');

      const huashan = getPlaySessionResultSummary(createHuashanPlaySession('pass'), true);
      assert(huashan.metricTitle === '活动积分变化', 'huashan metric');
      assert(huashan.delta === '+26', 'huashan delta');
      assert(rowDetail(huashan.rows, '结算类型') === '活动成绩', 'huashan settlement type');
      assert(rowDetail(huashan.rows, '赛制') === '过关赛', 'huashan stage row');

      const friend = getPlaySessionResultSummary(createFriendPlaySession('ten-minute'), false);
      assert(friend.metricTitle === '好友局', 'friend metric');
      assert(friend.delta === '不计分', 'friend delta');
      assert(rowDetail(friend.rows, '结算类型') === '好友局', 'friend settlement type');
      assert(rowDetail(friend.rows, '结算').includes('不计分'), 'friend settlement row');
    },
  },
  {
    name: '复盘 rows 覆盖模块名场次局时步时门票和结算',
    run: () => {
      assertReplayRows(createCertificationPlaySession(), '棋力认证', '村级棋士I', '棋力分');
      assertReplayRows(createCoinPlaySession('random'), '铜钱场', '随机场', '铜钱');
      assertReplayRows(createMinutePlaySession('twenty-minute'), '积分场', '二十分钟', '积分');
      assertReplayRows(createRatingPlaySession(), '棋力评测', '15分钟评测局', '评测分');
      assertReplayRows(createHuashanPlaySession('summit'), '华山论剑', '山顶赛', '活动成绩');
      assertReplayRows(createFriendPlaySession('five-minute'), '好友对战', '5分钟好友房', '好友局');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
