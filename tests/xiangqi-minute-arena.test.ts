import {
  XIANGQI_MINUTE_ARENA_TITLE,
  getMinuteArenaByMode,
  getMinuteArenaRows,
  getMinuteArenaSession,
} from '../src/xiangqiMinuteArena.js';
import type { XiangqiMinuteArenaMode, XiangqiMinuteArenaSession } from '../src/xiangqiMinuteArena.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sessionText(session: XiangqiMinuteArenaSession): string {
  return [
    session.entryTitle,
    session.title,
    session.description,
    session.timeControl.label,
    session.ticket.label,
    ...session.actions.map((action) => action.label),
    ...session.scoringTips,
  ].join('\n');
}

const expectedModes: XiangqiMinuteArenaMode[] = ['five-minute', 'ten-minute', 'twenty-minute'];

const tests: TestCase[] = [
  {
    name: '积分场入口暴露三行分钟场并带在线人数',
    run: () => {
      const rows = getMinuteArenaRows();

      assert(XIANGQI_MINUTE_ARENA_TITLE === '积分场', 'entry title should be 积分场');
      assert(rows.length === 3, 'minute arena should expose three rows');
      assert(rows.map((row) => row.title).join('/') === '五分钟/十分钟/二十分钟', 'row titles');
      assert(rows.map((row) => row.mode).join('/') === expectedModes.join('/'), 'row modes');

      rows.forEach((row) => {
        assert(row.online > 0, `${row.mode} should have online count`);
        assert(row.onlineLabel === `${row.online} 人在线`, `${row.mode} online label`);
      });
    },
  },
  {
    name: '每个分钟场进入后都有局时、步时、前三步和门票配置',
    run: () => {
      const expectedMinutes: Record<XiangqiMinuteArenaMode, 5 | 10 | 20> = {
        'five-minute': 5,
        'ten-minute': 10,
        'twenty-minute': 20,
      };

      expectedModes.forEach((mode) => {
        const session = getMinuteArenaSession(mode);
        const minutes = expectedMinutes[mode];
        const text = sessionText(session);

        assert(session.entryTitle === '积分场', `${mode} entry title`);
        assert(session.timeControl.totalMinutes === minutes, `${mode} total minutes`);
        assert(session.timeControl.moveSeconds === 60, `${mode} move seconds`);
        assert(session.timeControl.openingMoveCount === 3, `${mode} opening move count`);
        assert(session.timeControl.openingMoveSeconds === 30, `${mode} opening move seconds`);
        assert(session.ticket.amount === 2500, `${mode} ticket amount`);
        assert(session.ticket.currency === '铜钱', `${mode} ticket currency`);
        assert(text.includes(`局时 ${minutes} 分钟`), `${mode} should mention total minutes`);
        assert(text.includes('步时 1 分钟'), `${mode} should mention move time`);
        assert(text.includes('前 3 步 30 秒'), `${mode} should mention opening move time`);
        assert(text.includes('门票 2500 铜钱'), `${mode} should mention ticket`);
      });
    },
  },
  {
    name: '本场说明包含换桌、开始和积分扣分规则',
    run: () => {
      expectedModes.forEach((mode) => {
        const session = getMinuteArenaSession(mode);
        const text = sessionText(session);

        assert(session.actions.map((action) => action.label).join('/') === '换桌/开始', `${mode} actions`);
        assert(text.includes('胜负') && text.includes('积分') && text.includes('头衔'), `${mode} scoring title impact`);
        assert(text.includes('匹配成功') && text.includes('逃跑') && text.includes('超时') && text.includes('扣分'), `${mode} escape timeout penalty`);
        assert(text.includes('和局') && text.includes('先手') && text.includes('扣分'), `${mode} draw first-move penalty`);
      });
    },
  },
  {
    name: '按 mode 查询返回完整场次并与列表一致',
    run: () => {
      getMinuteArenaRows().forEach((row) => {
        const arena = getMinuteArenaByMode(row.mode);

        assert(arena.mode === row.mode, `${row.mode} mode`);
        assert(arena.title === row.title, `${row.mode} title`);
        assert(arena.online === row.online, `${row.mode} online`);
        assert(arena.onlineLabel === row.onlineLabel, `${row.mode} online label`);
        assert(arena.description.length > 0, `${row.mode} description`);
        assert(arena.scoringTips.length >= 3, `${row.mode} scoring tips`);
      });
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
