import {
  coinArenaRandomOpening,
  defaultCoinArenaWallet,
  getCoinArenaResources,
  getCoinArenaRows,
  getCoinArenaSession,
  needsCoinRelief,
} from '../src/xiangqiCoinArena.js';
import type { XiangqiCoinArenaRow, XiangqiCoinArenaRowId } from '../src/xiangqiCoinArena.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function row(id: XiangqiCoinArenaRowId): XiangqiCoinArenaRow {
  const found = getCoinArenaRows().find((item) => item.id === id);
  assert(found, `missing coin arena row: ${id}`);
  return found;
}

const expectedRowIds: XiangqiCoinArenaRowId[] = [
  'random',
  'five-primary',
  'five-middle',
  'five-advanced',
  'ten-primary',
  'twenty-primary',
  'endgame-coin',
];

const tests: TestCase[] = [
  {
    name: '铜钱场资产栏显示金色和银色资源默认值',
    run: () => {
      assert(defaultCoinArenaWallet.gold === 0, 'default gold resource');
      assert(defaultCoinArenaWallet.silver === 8330, 'default silver resource');

      const resources = getCoinArenaResources();
      assert(resources.length === 2, 'resource count');
      assert(resources[0].label === '金色资源' && resources[0].amount === 0, 'gold resource label and amount');
      assert(resources[1].label === '银色资源' && resources[1].amount === 8330, 'silver resource label and amount');
    },
  },
  {
    name: '场次列表包含观察到的七个铜钱场入口',
    run: () => {
      const rows = getCoinArenaRows();
      assert(rows.length === expectedRowIds.length, 'row count');
      expectedRowIds.forEach((id, index) => {
        assert(rows[index].id === id, `${id} row order`);
        assert(rows[index].onlineCount >= 0, `${id} should expose online count`);
        assert(rows[index].onlineLabel.length > 0, `${id} should expose online label`);
      });

      assert(row('random').title === '随机场', 'random title');
      assert(row('five-primary').title === '5分钟-初级', 'five primary title');
      assert(row('five-middle').title === '5分钟-中级', 'five middle title');
      assert(row('five-advanced').title === '5分钟-高级', 'five advanced title');
      assert(row('ten-primary').title === '10分钟-初级', 'ten primary title');
      assert(row('twenty-primary').title === '20分钟-初级', 'twenty primary title');
      assert(row('endgame-coin').title === '残局-铜钱场', 'endgame coin title');
    },
  },
  {
    name: '各行包含指定底注准入范围和加成',
    run: () => {
      const random = row('random');
      assert(random.baseStake === 5000, 'random base stake');
      assert(random.admission.label === '6000以上', 'random admission');
      assert(random.bonus.rate === 0, 'random bonus');

      const fivePrimary = row('five-primary');
      assert(fivePrimary.baseStake === 4500, '5m primary base stake');
      assert(fivePrimary.admission.label === '6000--20万', '5m primary admission');
      assert(fivePrimary.bonus.rate === 0, '5m primary bonus');

      const fiveMiddle = row('five-middle');
      assert(fiveMiddle.baseStake === 20000, '5m middle base stake');
      assert(fiveMiddle.baseStakeLabel === '2万', '5m middle stake label');
      assert(fiveMiddle.admission.label === '2.5万--80万', '5m middle admission');
      assert(fiveMiddle.bonus.rate === 15 && fiveMiddle.bonus.label === '+15%', '5m middle bonus');

      const fiveAdvanced = row('five-advanced');
      assert(fiveAdvanced.baseStake === 50000, '5m advanced base stake');
      assert(fiveAdvanced.admission.label === '6万以上', '5m advanced admission');
      assert(fiveAdvanced.bonus.rate === 30 && fiveAdvanced.bonus.label === '+30%', '5m advanced bonus');

      const tenPrimary = row('ten-primary');
      assert(tenPrimary.baseStake === 4500, '10m primary base stake');
      assert(tenPrimary.admission.label === '6000以上', '10m primary admission');

      const twentyPrimary = row('twenty-primary');
      assert(twentyPrimary.baseStake === 4000, '20m primary base stake');
      assert(twentyPrimary.admission.label === '6000以上', '20m primary admission');
    },
  },
  {
    name: '随机场暴露开局说明门票输赢和计时规则',
    run: () => {
      assert(coinArenaRandomOpening.description === '系统随机开局直接对弈', 'random description');
      assert(coinArenaRandomOpening.ticket === 1000, 'random ticket');
      assert(coinArenaRandomOpening.winLoss === 5000, 'random win/loss');
      assert(coinArenaRandomOpening.totalMinutes === 8, 'random total minutes');
      assert(coinArenaRandomOpening.moveSeconds === 60, 'random move seconds');
      assert(coinArenaRandomOpening.openingMoveCount === 3, 'random opening move count');
      assert(coinArenaRandomOpening.openingMoveSeconds === 90, 'random opening move seconds');

      const random = row('random');
      assert(random.randomOpening?.ticket === 1000, 'row should include random opening ticket');
      assert(random.randomOpening.timeControlLabel.includes('8分钟'), 'time label should include 8 minutes');
      assert(random.randomOpening.timeControlLabel.includes('60秒步时'), 'time label should include move time');
      assert(random.randomOpening.timeControlLabel.includes('前3步90秒'), 'time label should include opening time');
    },
  },
  {
    name: '准入 helper 返回会话且不直接触发支付',
    run: () => {
      const session = getCoinArenaSession('random');
      assert(session.canEnter === true, 'default wallet can enter random arena');
      assert(session.paymentRequired === false, 'session payment flag');
      assert(session.opensPayment === false, 'session should not open payment');
      assert(session.blockedReason === undefined, 'default wallet should not be blocked');

      const highBalanceSession = getCoinArenaSession('five-primary', { gold: 0, silver: 250000 });
      assert(highBalanceSession.canEnter === false, 'above max should be blocked');
      assert(highBalanceSession.blockedReason === 'above-limit', 'above max reason');
      assert(highBalanceSession.reliefPrompt === undefined, 'above max should not show relief');
    },
  },
  {
    name: '铜钱不足时返回救济和充值提示但不拉起支付',
    run: () => {
      assert(needsCoinRelief(5999, 'random') === true, 'low random balance needs relief');
      assert(needsCoinRelief({ gold: 0, silver: 6000 }, 'random') === false, 'threshold balance can enter');
      assert(needsCoinRelief({ gold: 0, silver: 24000 }, 'five-middle') === true, 'middle threshold relief');

      const session = getCoinArenaSession('five-middle', { gold: 0, silver: 24000 });
      assert(session.canEnter === false, 'low middle balance cannot enter');
      assert(session.blockedReason === 'coin-shortage', 'low balance reason');
      assert(session.paymentRequired === false, 'low balance still should not require payment');
      assert(session.opensPayment === false, 'low balance should not open payment');
      assert(session.reliefPrompt?.title === '铜钱不足', 'relief title');
      assert(session.reliefPrompt?.message.includes('领取救济'), 'relief message should mention relief');
      assert(session.reliefPrompt?.message.includes('充值提示'), 'relief message should mention recharge hint');
      assert(session.reliefPrompt?.opensPayment === false, 'relief prompt should not open payment');
      session.reliefPrompt?.actions.forEach((action) => {
        assert(action.opensPayment === false, `${action.id} should not open payment`);
      });
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
