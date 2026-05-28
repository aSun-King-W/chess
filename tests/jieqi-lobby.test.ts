import {
  getJieqiFeatureAction,
  getJieqiRuleCallouts,
  jieqiFeatureDockItems,
  jieqiFeatureEntries,
} from '../src/jieqiLobby.js';
import type { JieqiFeatureEntryId } from '../src/jieqiLobby.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function entry(id: JieqiFeatureEntryId) {
  const found = jieqiFeatureEntries.find((item) => item.id === id);
  assert(found, `missing entry: ${id}`);
  return found;
}

function assertIncludes(value: string | undefined, expected: string, label: string) {
  assert(value?.includes(expected), `${label}: expected to include ${expected}`);
}

const expectedEntryIds: JieqiFeatureEntryId[] = [
  'rating',
  'normal',
  'middle',
  'expert',
  'elite',
  'friend',
  'records',
  'daily-benefits',
  'events',
  'ad-time',
  'shop',
];

const tests: TestCase[] = [
  {
    name: '所有揭棋右侧入口都有可展示动作',
    run: () => {
      expectedEntryIds.forEach((id) => {
        const feature = entry(id);
        const action = getJieqiFeatureAction(id);
        assert(action.entryId === id, `${id} action should point at entry`);
        assert(action.type === feature.actionType, `${id} action type should mirror entry`);
        assert(action.title.length > 0, `${id} action should have title`);
        assert(action.description.length > 0, `${id} action should have description`);
        assert(action.cta.length > 0, `${id} action should have cta`);
      });
    },
  },
  {
    name: '场次包含当前观察到的底注奖励和准入限制',
    run: () => {
      const normal = entry('normal');
      assert(normal.baseStake === 4500, 'normal base stake');
      assert(normal.wealthRange === '6000--20万', 'normal wealth range');
      assertIncludes(normal.entryLimit, '6000 至 20万', 'normal entry limit');

      const middle = entry('middle');
      assert(middle.baseStake === 15000, 'middle base stake');
      assert(middle.wealthRange === '2万--80万', 'middle wealth range');
      assert(middle.bonusRate === 15, 'middle bonus');

      const expert = entry('expert');
      assert(expert.baseStake === 50000, 'expert base stake');
      assert(expert.wealthRange === '6万以上', 'expert wealth range');
      assert(expert.bonusRate === 30, 'expert bonus');

      const elite = entry('elite');
      assert(elite.baseStake === 300000, 'elite base stake');
      assert(elite.wealthRange === '35万以上', 'elite wealth range');
      assert(elite.bonusRate === 30, 'elite bonus');
    },
  },
  {
    name: '揭棋评测包含局时步时和前三步配置',
    run: () => {
      const rating = entry('rating');
      assert(rating.matchConfig?.totalMinutes === 10, 'rating total minutes');
      assert(rating.matchConfig.moveSeconds === 60, 'rating move seconds');
      assert(rating.matchConfig.openingMoveCount === 3, 'rating opening move count');
      assert(rating.matchConfig.openingMoveSeconds === 30, 'rating opening move seconds');
      assertIncludes(rating.matchConfig.timeControl, '10 分钟', 'rating time control');
      assertIncludes(rating.matchConfig.timeControl, '60 秒', 'rating time control');
      assertIncludes(rating.matchConfig.timeControl, '前 3 步 30 秒', 'rating time control');
    },
  },
  {
    name: '规则提示包含当前揭棋玩法和禁着判和约束',
    run: () => {
      const titles = getJieqiRuleCallouts('rating').map((item) => item.title);
      assert(titles.includes('暗子翻明'), 'rule should include hidden reveal');
      assert(titles.includes('士象过河'), 'rule should include advisor elephant crossing river');
      assert(titles.includes('长将长捉禁着'), 'rule should include long check/chase ban');
      assert(titles.includes('40 回合无吃子判和'), 'rule should include 40-round draw');
      assert(titles.includes('7 回合后议和认输'), 'rule should include seven-round resign/draw limit');
    },
  },
  {
    name: '商城和支付相关入口不会直接支付',
    run: () => {
      const shopAction = getJieqiFeatureAction('shop');
      assert(shopAction.type === 'show-panel', 'shop should only show panel');
      assert(shopAction.payload.panel === 'jieqi-shop', 'shop panel');
      assert(shopAction.paymentRequired === false, 'shop should not require direct payment');

      const ratingAction = getJieqiFeatureAction('rating');
      assert(ratingAction.paymentRequired === false, 'rating action should not directly pay ticket');
      assert(ratingAction.payload.matchConfig?.ticket === 2000, 'rating should expose ticket as config only');
    },
  },
  {
    name: '底部功能栏能映射到入口模型',
    run: () => {
      assert(jieqiFeatureDockItems.length === 4, 'dock item count');
      jieqiFeatureDockItems.forEach((item) => {
        const action = getJieqiFeatureAction(item.entryId);
        assert(action.type === 'show-panel', `${item.label} should open a panel`);
        assert(action.paymentRequired === false, `${item.label} should not directly pay`);
      });
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
