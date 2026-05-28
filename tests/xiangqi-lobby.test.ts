import {
  XIANGQI_FRIEND_MATCH_GUIDE,
  getXiangqiFeatureAction,
  getXiangqiHelpTopic,
  xiangqiFeatureDockItems,
  xiangqiFeatureEntries,
} from '../src/xiangqiLobby.js';
import type { XiangqiFeatureAction, XiangqiFeatureEntryId } from '../src/xiangqiLobby.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function textOf(action: XiangqiFeatureAction): string {
  return [
    action.title,
    action.description,
    action.cta,
    ...action.ruleTips,
    ...action.riskTips,
    action.match ? JSON.stringify(action.match) : '',
  ].join('\n');
}

const requiredEntryIds: XiangqiFeatureEntryId[] = [
  'rank-certification',
  'endgame',
  'skill-evaluation',
  'coin-arena',
  'huashan',
  'ranked-5',
  'ranked-10',
  'ranked-20',
  'friend-match',
  'ai-match',
  'my-records',
  'tournament',
  'daily-benefits',
  'activity-center',
  'ad-time',
  'shop',
];

const tests: TestCase[] = [
  {
    name: '所有象棋右侧窗口入口都有可展示动作',
    run: () => {
      const ids = xiangqiFeatureEntries.map((entry) => entry.id);
      for (const id of requiredEntryIds) {
        assert(ids.includes(id), `${id} should be registered`);
        const action = getXiangqiFeatureAction(id);
        assert(action.title.length > 0, `${id} action needs title`);
        assert(action.description.length > 0, `${id} action needs description`);
        assert(action.cta.length > 0, `${id} action needs cta`);
        assert(action.ruleTips.length > 0, `${id} action needs rule tips`);
        assert(action.riskTips.length > 0, `${id} action needs risk tips`);
        assert(['start-match', 'open-puzzle', 'show-panel', 'open-guide', 'disabled'].includes(action.type), `${id} action type`);
      }
      assert(xiangqiFeatureDockItems.length === xiangqiFeatureEntries.length, 'dock mirrors all entries');
    },
  },
  {
    name: '好友对战文案使用完整指定版本',
    run: () => {
      const entry = xiangqiFeatureEntries.find((item) => item.id === 'friend-match');
      const action = getXiangqiFeatureAction('friend-match');
      const help = getXiangqiHelpTopic('friend-match');

      assert(entry?.description === XIANGQI_FRIEND_MATCH_GUIDE, 'entry should use exact friend guide');
      assert(action.description === XIANGQI_FRIEND_MATCH_GUIDE, 'action should use exact friend guide');
      assert(action.ruleTips.includes(XIANGQI_FRIEND_MATCH_GUIDE), 'rule tips should preserve exact friend guide');
      assert(help.paragraphs.includes(XIANGQI_FRIEND_MATCH_GUIDE), 'help topic should expose exact friend guide');
      assert(
        XIANGQI_FRIEND_MATCH_GUIDE ===
          '方法一进入对应棋种（象棋、揭棋、翻翻棋）点击好友对战、选择对局时长、邀请关注棋友或 QQ/微信好友链接；方法二约定棋社号和桌号。',
        'friend guide constant should match product copy exactly',
      );
    },
  },
  {
    name: '棋力评测体现评测维度、判和和强制变招规则',
    run: () => {
      const action = getXiangqiFeatureAction('skill-evaluation');
      const text = textOf(action);
      assert(action.type === 'show-panel', 'evaluation should open a panel');
      assert(text.includes('棋力评测') || text.includes('棋力'), 'evaluation should mention skill');
      assert(text.includes('失误') && text.includes('建议'), 'evaluation should include report dimensions');
      assert(text.includes('强制变招'), 'evaluation should mention forced variation prompt');
    },
  },
  {
    name: '5/10/20 分钟场体现积分、头衔、有效局和扣分风险',
    run: () => {
      for (const id of ['ranked-5', 'ranked-10', 'ranked-20'] as const) {
        const action = getXiangqiFeatureAction(id);
        const text = textOf(action);
        assert(action.type === 'start-match', `${id} should start match`);
        assert(action.match?.mode === 'ranked', `${id} should be ranked`);
        assert(action.match?.rated === true, `${id} should be rated`);
        assert(action.match?.titleEligible === true, `${id} should count toward titles`);
        assert(action.match?.requiresEffectiveGame === true, `${id} should require effective games`);
        assert(text.includes('积分'), `${id} should mention points`);
        assert(text.includes('头衔'), `${id} should mention title`);
        assert(text.includes('有效局'), `${id} should mention effective games`);
        assert(text.includes('逃跑') && text.includes('扣分'), `${id} should mention escape penalty`);
      }
    },
  },
  {
    name: '华山论剑体现赛季、榜单、判和、强制变招和扣分风险',
    run: () => {
      const action = getXiangqiFeatureAction('huashan');
      const text = textOf(action);
      assert(action.type === 'start-match', 'huashan should start match');
      assert(action.match?.mode === 'huashan', 'huashan mode');
      assert(action.match?.requiresEffectiveGame === true, 'huashan needs effective games');
      assert(text.includes('赛季') && text.includes('榜单'), 'huashan should mention season ranking');
      assert(text.includes('判和'), 'huashan should mention draw adjudication');
      assert(text.includes('强制变招'), 'huashan should mention forced variation prompt');
      assert(text.includes('扣分'), 'huashan should mention penalty');
    },
  },
  {
    name: '付费和商城类入口不直接触发支付',
    run: () => {
      for (const id of ['shop', 'ad-time', 'daily-benefits', 'activity-center'] as const) {
        const action = getXiangqiFeatureAction(id);
        assert(action.type === 'disabled' || action.type === 'open-guide', `${id} should only guide or stay disabled`);
      }

      const shopText = textOf(getXiangqiFeatureAction('shop'));
      assert(shopText.includes('不创建订单') && shopText.includes('不扣费') && shopText.includes('不拉起支付'), 'shop payment guardrails');
    },
  },
];

let passed = 0;

for (const test of tests) {
  try {
    test.run();
    passed += 1;
    console.log(`✓ ${test.name}`);
  } catch (error) {
    console.error(`✗ ${test.name}`);
    throw error;
  }
}

console.log(`xiangqi lobby tests: ${passed}/${tests.length} passed`);
