import {
  buildCoinArenaSelection,
  buildMinuteArenaSelection,
} from '../src/xiangqiFeatureSelection.js';
import type {
  XiangqiCoinArenaSelectionCard,
  XiangqiMinuteArenaSelectionCard,
} from '../src/xiangqiFeatureSelection.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function coinCard(id: XiangqiCoinArenaSelectionCard['id']): XiangqiCoinArenaSelectionCard {
  const card = buildCoinArenaSelection().cards.find((item) => item.id === id);
  assert(card, `missing coin card: ${id}`);
  return card;
}

function minuteCard(id: XiangqiMinuteArenaSelectionCard['id']): XiangqiMinuteArenaSelectionCard {
  const card = buildMinuteArenaSelection({ selectedMode: 'ten-minute' }).cards.find(
    (item) => item.id === id,
  );
  assert(card, `missing minute card: ${id}`);
  return card;
}

const tests: TestCase[] = [
  {
    name: '铜钱场七行都生成可点选卡片并保留默认选中态',
    run: () => {
      const selection = buildCoinArenaSelection();

      assert(selection.kind === 'coin-arena-selection', 'coin selection kind');
      assert(selection.selectedCardId === 'random', 'default selected coin card');
      assert(selection.cards.length === 7, 'coin card count');
      assert(coinCard('random').selected === true, 'random should be selected by default');
      assert(coinCard('five-primary').selected === false, 'only random should be selected by default');
    },
  },
  {
    name: '默认 8330 铜钱可进入随机和三个初级场',
    run: () => {
      for (const id of ['random', 'five-primary', 'ten-primary', 'twenty-primary'] as const) {
        const card = coinCard(id);

        assert(card.disabled === false, `${id} should be enabled`);
        assert(card.target === 'coin-arena', `${id} target`);
        assert(card.disabledReason === undefined, `${id} disabled reason`);
        assert(card.reliefMessage === undefined, `${id} relief message`);
      }
    },
  },
  {
    name: '默认 8330 铜钱不足时中级和高级卡片禁用并返回救济提示',
    run: () => {
      for (const id of ['five-middle', 'five-advanced'] as const) {
        const card = coinCard(id);

        assert(card.disabled === true, `${id} should be disabled`);
        assert(card.disabledReason === 'coin-shortage', `${id} disabled reason`);
        assert(card.reliefMessage?.includes('领取救济'), `${id} should mention relief`);
        assert(card.reliefMessage?.includes('充值提示'), `${id} should mention recharge hint`);
      }
    },
  },
  {
    name: '残局铜钱场卡片指向残局模块',
    run: () => {
      const card = coinCard('endgame-coin');

      assert(card.disabled === false, 'endgame coin card should be enabled with default wallet');
      assert(card.target === 'puzzle', 'endgame coin target should be puzzle');
      assert(card.primaryLabel === '进入残局', 'endgame primary label');
    },
  },
  {
    name: '分钟场三行可切换并只给选中项 badge',
    run: () => {
      const selection = buildMinuteArenaSelection({ selectedMode: 'ten-minute' });

      assert(selection.kind === 'minute-arena-selection', 'minute selection kind');
      assert(selection.selectedMode === 'ten-minute', 'selected minute mode');
      assert(selection.cards.length === 3, 'minute card count');
      assert(minuteCard('ten-minute').selected === true, 'ten-minute selected');
      assert(minuteCard('ten-minute').badge === '已选', 'selected badge');
      assert(minuteCard('five-minute').badge === undefined, 'unselected five-minute badge');
      assert(minuteCard('twenty-minute').selected === false, 'twenty-minute unselected');
    },
  },
  {
    name: '分钟场卡片返回对应 primary label',
    run: () => {
      const labels = buildMinuteArenaSelection({ selectedMode: 'twenty-minute' }).cards.map(
        (card) => card.primaryLabel,
      );

      assert(
        labels.join('/') === '开始五分钟/开始十分钟/开始二十分钟',
        'minute primary labels',
      );
    },
  },
];

for (const test of tests) {
  test.run();
  console.log(`ok - ${test.name}`);
}
