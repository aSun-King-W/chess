import {
  getCertificationHistoryBestNodes,
  getCertificationRuleSummary,
  getCertificationSessionRows,
  xiangqiCertificationConfig,
} from '../src/xiangqiCertification.js';
import type {
  CertificationOpponentLevel,
  CertificationRuleSummaryItem,
  CertificationSessionRow,
} from '../src/xiangqiCertification.js';

type TestCase = {
  name: string;
  run: () => void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function rowValue(rows: CertificationSessionRow[], id: string): string {
  const row = rows.find((item) => item.id === id);
  assert(row, `${id} row should exist`);
  return row.value;
}

function summaryText(items: CertificationRuleSummaryItem[]): string {
  return items.map((item) => `${item.title}\n${item.description}`).join('\n');
}

const tests: TestCase[] = [
  {
    name: '棋力认证第4届基础展示信息完整',
    run: () => {
      const rows = getCertificationSessionRows();

      assert(xiangqiCertificationConfig.title === '棋力认证第4届', 'title should match observed activity');
      assert(rowValue(rows, 'season-countdown') === '12天12时后结束', 'countdown text should match');
      assert(rowValue(rows, 'current-rank') === '村级棋士I', 'current rank should match');
      assert(['70/100', '85/100'].includes(rowValue(rows, 'next-progress')), 'progress should use an observed display format');
      assert(rowValue(rows, 'history-best') === '村级棋士I', 'history best should match');
      assert(rowValue(rows, 'reward-requirement') === '达到【棋圣V】及以上', 'reward requirement should match');
      assert(rowValue(rows, 'entry-resource') === '2500/次', 'entry resource should match');
    },
  },
  {
    name: '开局说明包含棋力分、局时、步时和前三步时限',
    run: () => {
      const rules = getCertificationRuleSummary();
      const text = summaryText(rules);

      assert(text.includes('输赢仅计算棋力分'), 'start description should mention skill score only');
      assert(text.includes('局时15分钟'), 'start description should mention 15 minute game');
      assert(text.includes('步时90秒'), 'start description should mention 90 second step');
      assert(text.includes('前3步30秒'), 'start description should mention first three moves');
      assert(xiangqiCertificationConfig.timeControl.totalMinutes === 15, 'total minutes should be structured');
      assert(xiangqiCertificationConfig.timeControl.stepSeconds === 90, 'step seconds should be structured');
      assert(xiangqiCertificationConfig.timeControl.openingMoveCount === 3, 'opening move count should be structured');
      assert(xiangqiCertificationConfig.timeControl.openingStepSeconds === 30, 'opening seconds should be structured');
    },
  },
  {
    name: '规则摘要覆盖初始积分、同低高等级胜平负变化和证书发放',
    run: () => {
      const rules = getCertificationRuleSummary();
      const text = summaryText(rules);
      const levels: CertificationOpponentLevel[] = ['same', 'lower', 'higher'];

      assert(rules.some((item) => item.id === 'initial-scores'), 'initial score rule should exist');
      assert(text.includes('初始等级积分') && text.includes('村级棋士I 0分'), 'initial score text should include starting rank');
      for (const level of levels) {
        assert(
          xiangqiCertificationConfig.scoreChanges.some((item) => item.opponentLevel === level),
          `${level} score change should exist`,
        );
      }
      assert(text.includes('同等级') && text.includes('低等级') && text.includes('高等级'), 'score changes should cover all opponent levels');
      assert(text.includes('胜') && text.includes('平') && text.includes('负'), 'score changes should mention outcomes');
      assert(text.includes('活动结束后') && text.includes('证书'), 'certificate issue rule should exist');
    },
  },
  {
    name: '历史最高展示节点不少于3个且含当前最高等级',
    run: () => {
      const nodes = getCertificationHistoryBestNodes();

      assert(nodes.length >= 3, 'history best display should have at least three nodes');
      assert(nodes.some((node) => node.featured && node.rank === '村级棋士I'), 'featured node should show current best rank');
      assert(nodes.every((node) => node.progress.current <= node.progress.target), 'progress values should be bounded');
      assert(nodes.some((node) => node.progress.label === '85/100'), 'history nodes can expose the alternate observed progress');
    },
  },
];

tests.forEach((test) => {
  test.run();
  console.log(`ok - ${test.name}`);
});
