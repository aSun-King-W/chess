import {
  XIANGQI_FRIEND_ROOM_DURATIONS,
  createFriendRoom,
  createFriendRoomArchiveRecord,
  createFriendRoomSettlement,
  filterFriendRoomArchiveRecords,
  getFriendRoomReviewInfo,
  setFriendRoomArchiveFavorite,
  toggleFriendRoomArchiveFavorite,
} from '../src/xiangqiFriendRoom.js';
import type {
  XiangqiFriendRoom,
  XiangqiFriendRoomArchiveRecord,
  XiangqiFriendRoomDuration,
} from '../src/xiangqiFriendRoom.js';

const nodeTestSpecifier = 'node:test';
const { test } = await import(nodeTestSpecifier) as { test: (name: string, fn: () => void) => unknown };

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

function makeRecord(
  room: XiangqiFriendRoom,
  result: 'red-win' | 'black-win' | 'draw',
  selfSide: 'red' | 'black',
  opponentName: string,
  startedAt: string,
): XiangqiFriendRoomArchiveRecord {
  return createFriendRoomArchiveRecord({
    room,
    result,
    selfSide,
    opponentName,
    startedAt,
    endedAt: startedAt.replace('10:00', '10:18'),
    moves: ['炮二平五', '马8进7', '马二进三'],
  });
}

const tests: TestCase[] = [
  {
    name: '好友房只暴露5/10/20分钟并生成固定步时配置',
    run: () => {
      assert(XIANGQI_FRIEND_ROOM_DURATIONS.join('/') === '5/10/20', 'duration options');

      XIANGQI_FRIEND_ROOM_DURATIONS.forEach((duration) => {
        const room = createFriendRoom(duration, duration);

        assert(room.duration === duration, `${duration} duration`);
        assert(room.timeControl.totalMinutes === duration, `${duration} total minutes`);
        assert(room.timeControl.totalSeconds === duration * 60, `${duration} total seconds`);
        assert(room.timeControl.moveSeconds === 60, `${duration} move seconds`);
        assert(room.timeControl.openingMoveCount === 3, `${duration} opening move count`);
        assert(room.timeControl.openingMoveSeconds === 30, `${duration} opening move seconds`);
        assert(room.timeControl.label === `${duration}分钟`, `${duration} label`);
        assert(room.timeControl.stepLabel === '前3步30秒，之后60秒', `${duration} step label`);
      });
    },
  },
  {
    name: '创建本地房间生成桌号棋社号邀请占位和安全提示',
    run: () => {
      const room = createFriendRoom(10, 42);

      assert(room.moduleName === '好友对战', 'module');
      assert(/^T[0-9]{5}$/.test(room.tableNo), 'table number format');
      assert(/^C[0-9]{5}$/.test(room.clubNo), 'club number format');
      assert(room.invite.message.includes(room.tableNo), 'invite message table');
      assert(room.invite.message.includes(room.clubNo), 'invite message club');
      assert(room.invite.copyText.includes('10分钟'), 'invite copy duration');
      assert(room.invite.placeholder.includes('占位'), 'invite placeholder');
      assert(room.safetyTips.length >= 3, 'safety tips count');
      assert(room.safetyTips.some((tip) => tip.text.includes('敏感信息')), 'safety sensitive info');
      assert(room.replayTags.includes('好友对战'), 'replay tag module');
      assert(room.replayTags.includes('非计分'), 'replay tag settlement');
    },
  },
  {
    name: '非计分结算不改变积分棋力分铜钱或头衔',
    run: () => {
      const room = createFriendRoom(20, 7);
      const settlement = createFriendRoomSettlement(room, 'black-win');

      assert(settlement.winnerLabel === '黑方胜', 'winner label');
      assert(settlement.settlementType === '非计分', 'settlement type');
      assert(settlement.scoreDelta === 0, 'score delta');
      assert(settlement.coinDelta === 0, 'coin delta');
      assert(settlement.titleDelta === '无变化', 'title delta');
      assert(settlement.summary.includes('非计分'), 'summary');
      assert(rowDetail(settlement.rows, '桌号') === room.tableNo, 'settlement table');
      assert(rowDetail(settlement.rows, '棋社号') === room.clubNo, 'settlement club');
      assert(rowDetail(settlement.rows, '结算类型') === '非计分', 'settlement row type');
    },
  },
  {
    name: '我的棋谱可从好友房结果生成记录并提供复盘信息',
    run: () => {
      const room = createFriendRoom(5, 9);
      const record = makeRecord(room, 'red-win', 'red', '小明', '2026-05-28T10:00:00.000Z');
      const review = getFriendRoomReviewInfo(record);

      assert(record.module === '好友对战', 'record module');
      assert(record.result === '胜', 'record result');
      assert(record.rawResult === 'red-win', 'record raw result');
      assert(record.tableNo === room.tableNo, 'record table');
      assert(record.clubNo === room.clubNo, 'record club');
      assert(record.duration === 5, 'record duration');
      assert(record.moveCount === 3, 'record move count');
      assert(record.favorite === false, 'record default favorite');
      assert(record.settlementType === '非计分', 'record settlement type');
      assert(review.recordId === record.id, 'review id');
      assert(review.moves.join('/') === '炮二平五/马8进7/马二进三', 'review moves');
      assert(review.tags.includes('好友对战') && review.tags.includes('胜'), 'review tags');
    },
  },
  {
    name: '我的棋谱支持模块结果时长关键词筛选和收藏取消收藏',
    run: () => {
      const five = createFriendRoom(5, 1);
      const ten = createFriendRoom(10, 2);
      const twenty = createFriendRoom(20, 3);
      const records = [
        makeRecord(five, 'red-win', 'red', '小明', '2026-05-28T10:00:00.000Z'),
        makeRecord(ten, 'black-win', 'red', '阿华', '2026-05-28T11:00:00.000Z'),
        makeRecord(twenty, 'draw', 'black', '棋友小林', '2026-05-28T12:00:00.000Z'),
      ];

      assert(filterFriendRoomArchiveRecords(records, { module: '好友对战' }).length === 3, 'module filter');
      assert(filterFriendRoomArchiveRecords(records, { result: '胜' }).length === 1, 'win filter');
      assert(filterFriendRoomArchiveRecords(records, { result: '负' })[0].opponentName === '阿华', 'loss filter');
      assert(filterFriendRoomArchiveRecords(records, { duration: 20 })[0].result === '和', 'duration filter');
      assert(filterFriendRoomArchiveRecords(records, { opponentKeyword: '小' }).length === 2, 'keyword filter');

      const favorited = setFriendRoomArchiveFavorite(records, records[1].id, true);
      assert(favorited[1].favorite === true, 'set favorite');
      assert(records[1].favorite === false, 'favorite should be immutable');
      assert(filterFriendRoomArchiveRecords(favorited, { favoriteOnly: true }).length === 1, 'favorite filter');

      const toggled = toggleFriendRoomArchiveFavorite(favorited, records[1].id);
      assert(toggled[1].favorite === false, 'toggle favorite off');
    },
  },
  {
    name: '不支持的好友房时长会被拒绝',
    run: () => {
      let didThrow = false;

      try {
        createFriendRoom(15 as XiangqiFriendRoomDuration);
      } catch (error) {
        didThrow = error instanceof Error && error.message.includes('5/10/20分钟');
      }

      assert(didThrow, 'invalid duration should throw');
    },
  },
];

tests.forEach((testCase) => {
  void test(testCase.name, testCase.run);
});
