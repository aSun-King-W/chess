import {
  applyJieqiStateMove,
  createJieqiBoardState,
  getJieqiAdmission,
  getJieqiArenaConfig,
  getJieqiCaptureStats,
  getJieqiEntryRows,
  getJieqiPlaceholder,
  getJieqiReplayRows,
  revealJieqiPieceByRule,
  settleJieqiRating,
} from '../src/xiangqiJieqi.js';
import type { Piece } from '../src/game.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function rowDetail(rows: Array<{ title: string; detail: string }>, title: string): string {
  const row = rows.find((item) => item.title === title);
  assert(row, `missing row: ${title}`);
  return row.detail;
}

function entryValue(rows: Array<{ id: string; label: string; value: string }>, id: string): string {
  const row = rows.find((item) => item.id === id);
  assert(row, `missing entry row: ${id}`);
  return row.value;
}

function piece(partial: Partial<Piece> & Pick<Piece, 'id' | 'side' | 'kind' | 'x' | 'y'>): Piece {
  return {
    label: partial.kind === 'king' ? (partial.side === 'red' ? '帥' : '將') : '子',
    ...partial,
  };
}

const captureFixture: Piece[] = [
  piece({ id: 'rk', side: 'red', kind: 'king', x: 4, y: 9 }),
  piece({ id: 'bk', side: 'black', kind: 'king', x: 5, y: 0 }),
  piece({ id: 'rr', side: 'red', kind: 'rook', label: '車', x: 4, y: 1 }),
  piece({ id: 'bp', side: 'black', kind: 'pawn', label: '卒', x: 4, y: 0 }),
];

const tests: TestCase[] = [
  {
    name: '揭棋评测配置暴露门票局时步时前三步和结算类型',
    run: () => {
      const config = getJieqiArenaConfig('rating');
      assert(config.title === '揭棋评测', 'rating title');
      assert(config.ticket === 2000, 'rating ticket');
      assert(config.timeControl.totalMinutes === 10, 'rating total minutes');
      assert(config.timeControl.moveSeconds === 60, 'rating move seconds');
      assert(config.timeControl.openingMoveCount === 3, 'rating opening move count');
      assert(config.timeControl.openingMoveSeconds === 30, 'rating opening move seconds');
      assert(config.settlementType === '揭棋棋力分', 'rating settlement');

      const rows = getJieqiEntryRows('rating');
      assert(entryValue(rows, 'ticket') === '2000', 'entry ticket');
      assert(entryValue(rows, 'settlement') === '揭棋棋力分', 'entry settlement');
      assert(entryValue(rows, 'time-control').includes('10分钟'), 'entry time control');
    },
  },
  {
    name: '普通场余额不足展示安全救济占位且不触发支付广告',
    run: () => {
      const admission = getJieqiAdmission('normal', { gold: 0, silver: 5830 });
      assert(admission.status === 'insufficient', 'admission status');
      assert(!admission.canEnter, 'should not enter');
      assert(admission.title === '铜钱不足，领铜钱！', 'insufficient title');
      assert(admission.detail.includes('看视频'), 'should mention video relief placeholder');
      assert(admission.detail.includes('安全占位'), 'should mark safe placeholder');
      assert(admission.paymentRequired === false, 'payment disabled');

      const placeholder = getJieqiPlaceholder('coin-relief');
      assert(placeholder.actions.includes('看视频(安全占位)'), 'video action placeholder');
      assert(placeholder.paymentRequired === false, 'placeholder payment disabled');
    },
  },
  {
    name: '普通场准入能识别可进入和财富超出上限',
    run: () => {
      const allowed = getJieqiAdmission('normal', { gold: 0, silver: 6000 });
      assert(allowed.status === 'allowed', 'normal allowed');
      assert(allowed.canEnter, 'normal can enter');

      const tooRich = getJieqiAdmission('normal', { gold: 0, silver: 210000 });
      assert(tooRich.status === 'above-limit', 'normal above limit');
      assert(!tooRich.canEnter, 'above limit cannot enter normal');
      assert(tooRich.detail.includes('切换更高场次'), 'above limit guidance');
    },
  },
  {
    name: '暗子首次移动后翻明并记录生命周期',
    run: () => {
      const initial = createJieqiBoardState();
      assert(initial.lifecycles.rn1.state === 'hidden', 'horse starts hidden');

      const moved = applyJieqiStateMove(initial, 'rn1', { x: 2, y: 7 });
      assert(moved !== initial, 'legal move creates next state');
      assert(moved.moveCount === 1, 'move count');
      assert(moved.lifecycles.rn1.state === 'revealed', 'horse revealed');
      assert(moved.lifecycles.rn1.revealReason === 'first-move', 'reveal reason');
      assert(moved.lifecycles.rn1.revealedAtMove === 1, 'revealed move index');
      assert(initial.lifecycles.rn1.state === 'hidden', 'source state not mutated');
    },
  },
  {
    name: '规则指定翻明不产生走子但会更新暗子状态',
    run: () => {
      const initial = createJieqiBoardState();
      const revealed = revealJieqiPieceByRule(initial, 'rc1');
      assert(revealed.moveCount === 0, 'rule reveal should not add move');
      assert(revealed.lifecycles.rc1.state === 'revealed', 'piece revealed by rule');
      assert(revealed.lifecycles.rc1.revealReason === 'rule', 'rule reveal reason');
      assert(revealed.lifecycles.rc1.revealedAtMove === 0, 'rule reveal index');
    },
  },
  {
    name: '吃掉未揭示暗子时侧边统计显示暗并保留内部真实身份',
    run: () => {
      const initial = createJieqiBoardState(captureFixture);
      const next = applyJieqiStateMove(initial, 'rr', { x: 4, y: 0 });
      assert(next.captures.length === 1, 'capture recorded');

      const capture = next.captures[0];
      assert(capture.capturedId === 'bp', 'captured id');
      assert(capture.wasHidden, 'captured piece was hidden');
      assert(capture.visibleLabel === '暗', 'hidden capture visible label');
      assert(capture.capturedKind === 'pawn', 'internal kind kept');
      assert(capture.capturedLabel === '卒', 'internal label kept');
      assert(next.lifecycles.bp.state === 'captured', 'captured lifecycle');
      assert(next.lifecycles.bp.capturedWhileHidden, 'captured hidden lifecycle flag');

      const stats = getJieqiCaptureStats(next);
      assert(stats.black.total === 1, 'black captured total');
      assert(stats.black.hidden === 1, 'black hidden captured');
      assert(stats.black.badges.some((badge) => badge.label === '暗' && badge.count === 1), 'hidden badge count');
    },
  },
  {
    name: '局内菜单和邀请旁观都返回安全占位文案',
    run: () => {
      const invite = getJieqiPlaceholder('invite-spectator');
      assert(invite.title === '邀请旁观', 'invite title');
      assert(invite.detail.includes('不会拉起微信分享'), 'invite safe detail');

      const draw = getJieqiPlaceholder('draw-offer');
      assert(draw.title === '提和(3)', 'draw title');
      assert(draw.detail.includes('未满7回合'), 'draw seven round limit');

      const leave = getJieqiPlaceholder('leave');
      assert(leave.actions.includes('确定'), 'leave confirm');

      const resign = getJieqiPlaceholder('resign');
      assert(resign.detail.includes('立即判负'), 'resign result');
    },
  },
  {
    name: '评测结算 rows 包含胜利分差段位按钮和暗子统计',
    run: () => {
      const state = applyJieqiStateMove(createJieqiBoardState(captureFixture), 'rr', { x: 4, y: 0 });
      const settlement = settleJieqiRating('win', state, { ownRank: '揭1-1', opponentRank: '揭8-3' });
      assert(settlement.resultTitle === '胜利', 'result title');
      assert(settlement.ratingDelta === '+10', 'rating delta');
      assert(settlement.actions.join('/').includes('切换对手'), 'switch opponent action');
      assert(settlement.actions.join('/').includes('复盘分析'), 'replay analysis action');
      assert(rowDetail(settlement.rows, '揭棋评测分') === '+10', 'settlement rating row');
      assert(rowDetail(settlement.rows, '我方段位') === '揭1-1', 'own rank row');
      assert(rowDetail(settlement.rows, '对手段位') === '揭8-3', 'opponent rank row');
      assert(rowDetail(settlement.rows, '暗子翻明').includes('子已揭示'), 'reveal stats row');
    },
  },
  {
    name: '复盘 rows 覆盖模块场次局时步时门票结算和隐藏信息规则',
    run: () => {
      const state = applyJieqiStateMove(createJieqiBoardState(captureFixture), 'rr', { x: 4, y: 0 });
      const rows = getJieqiReplayRows('rating', state);
      assert(rowDetail(rows, '模块') === '揭棋', 'replay module');
      assert(rowDetail(rows, '场次') === '揭棋评测', 'replay arena');
      assert(rowDetail(rows, '局时') === '10分钟', 'replay total time');
      assert(rowDetail(rows, '步时') === '60秒', 'replay move time');
      assert(rowDetail(rows, '前三步') === '3步30秒', 'replay opening move time');
      assert(rowDetail(rows, '对局门票') === '2000', 'replay ticket');
      assert(rowDetail(rows, '结算类型') === '揭棋棋力分', 'replay settlement');
      assert(rowDetail(rows, '吃子记录').includes('暗子'), 'replay capture hidden label');
      assert(rowDetail(rows, '复盘隐藏信息').includes('未揭示暗子'), 'replay hidden information');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
