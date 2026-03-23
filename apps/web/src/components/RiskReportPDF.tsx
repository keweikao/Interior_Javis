import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  QuotationItem,
  SiteCondition,
  RiskAlert,
  Override,
} from '@q-check/construction-knowledge';

export interface RuleStats {
  totalRules: number;
  passedRules: number;
  triggeredRules: number;
  overriddenRules: number;
}

export interface RiskReportPDFProps {
  projectName: string;
  projectType: string;
  siteCondition: SiteCondition;
  items: QuotationItem[];
  totalAmount: number;
  alerts: RiskAlert[];
  overrides: Override[];
  ruleStats: RuleStats;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_build: '新成屋',
  mid_age: '中古屋翻新',
  old_renovation: '老屋翻新',
  partial: '局部裝修',
};

function formatCurrency(value: number): string {
  if (!value || value <= 0) return 'NT$ 0';
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const NAVY = '#1a2744';
const NAVY_LIGHT = '#2d4a7a';
const SECTION_BG = '#f4f6fa';
const ALERT_BG = '#fff8f0';
const JUDGMENT_BG = '#f0f4ff';
const JUDGMENT_BORDER = '#3b6fd4';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  // Header
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 4,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginBottom: 12,
  },
  // Meta
  metaBlock: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 9,
  },
  metaLabel: {
    width: 55,
    color: '#666666',
  },
  metaValue: {
    flex: 1,
  },
  metaConditionRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 9,
    gap: 12,
  },
  // Section headers
  sectionHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
    backgroundColor: SECTION_BG,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  // Checked rules table
  ruleRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  ruleCategory: {
    flex: 3,
    fontSize: 9,
  },
  ruleCount: {
    flex: 2,
    fontSize: 9,
    textAlign: 'center',
  },
  ruleStatus: {
    flex: 3,
    fontSize: 9,
    textAlign: 'right',
  },
  passedText: {
    color: '#16803c',
  },
  // Override entries
  overrideEntry: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 4,
  },
  overrideTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  overrideReason: {
    fontSize: 8,
    color: '#666666',
    paddingLeft: 12,
    marginTop: 1,
  },
  // Alert entries
  alertEntry: {
    backgroundColor: ALERT_BG,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#e8a020',
  },
  alertTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7a5500',
  },
  alertWhy: {
    fontSize: 8,
    color: '#8a6600',
    marginTop: 1,
  },
  // Judgment section
  judgmentBlock: {
    backgroundColor: JUDGMENT_BG,
    borderLeftWidth: 3,
    borderLeftColor: JUDGMENT_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
    marginBottom: 8,
  },
  judgmentHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 6,
  },
  judgmentIntro: {
    fontSize: 8,
    color: '#555555',
    marginBottom: 6,
  },
  judgmentItem: {
    marginBottom: 5,
  },
  judgmentItemTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
  },
  judgmentItemDetail: {
    fontSize: 8,
    color: '#555555',
    paddingLeft: 12,
    marginTop: 1,
  },
  judgmentItemArrow: {
    fontSize: 8,
    color: NAVY_LIGHT,
    fontWeight: 'bold',
    paddingLeft: 12,
    marginTop: 1,
  },
  // Footer
  footerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    marginTop: 16,
    marginBottom: 6,
  },
  footer: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
  footerWarning: {
    fontSize: 7,
    color: '#cc0000',
    textAlign: 'center',
    marginTop: 2,
  },
  numberPrefix: {
    fontSize: 9,
    color: '#666666',
    marginRight: 4,
  },
});

function computeCategoryStats(
  alerts: RiskAlert[],
  overrides: Override[],
) {
  // Count by category
  const depAlerts = alerts.filter((a) => a.category === 'dependency');
  const siteAlerts = alerts.filter((a) => a.category === 'site_conflict');
  const qtyAlerts = alerts.filter((a) => a.category === 'quantity');

  const depOverrides = overrides.filter((o) => o.ruleId.startsWith('dep-'));
  const siteOverrides = overrides.filter((o) => o.ruleId.startsWith('site-'));
  const qtyOverrides = overrides.filter((o) => o.ruleId.startsWith('qty-'));

  return [
    {
      label: '工序連動檢查',
      alerts: depAlerts.length,
      overridden: depOverrides.length,
    },
    {
      label: '現場條件檢查',
      alerts: siteAlerts.length,
      overridden: siteOverrides.length,
    },
    {
      label: '數量比例檢查',
      alerts: qtyAlerts.length,
      overridden: qtyOverrides.length,
    },
  ];
}

function computeClarityStats(items: QuotationItem[]) {
  const validItems = items.filter((i) => !!i.itemName);
  const filledCount = validItems.filter(
    (i) => i.includes || i.excludes,
  ).length;
  return { filled: filledCount, total: validItems.length };
}

export function RiskReportPDF({
  projectName,
  projectType,
  siteCondition,
  items,
  totalAmount,
  alerts,
  overrides,
  ruleStats,
}: RiskReportPDFProps) {
  const categoryStats = computeCategoryStats(alerts, overrides);
  const clarityStats = computeClarityStats(items);
  const budgetGap =
    siteCondition.clientBudget && siteCondition.clientBudget > 0
      ? (((siteCondition.clientBudget - totalAmount) / siteCondition.clientBudget) * 100).toFixed(1)
      : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Q-Check 風險檢核報告</Text>
        <View style={styles.headerDivider} />

        {/* Meta info */}
        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>案件：</Text>
            <Text style={styles.metaValue}>{projectName}</Text>
          </View>
          <View style={styles.metaConditionRow}>
            <Text>
              類型：{PROJECT_TYPE_LABELS[projectType] ?? projectType}
            </Text>
            <Text>坪數：{siteCondition.totalArea} 坪</Text>
            <Text>
              樓層：{siteCondition.floorLevel}F{' '}
              {siteCondition.hasElevator ? '' : '無電梯'}
            </Text>
          </View>
          <View style={styles.metaConditionRow}>
            {siteCondition.clientBudget && siteCondition.clientBudget > 0 ? (
              <Text>預算：{formatCurrency(siteCondition.clientBudget)}</Text>
            ) : null}
            <Text>報價總額：{formatCurrency(totalAmount)}</Text>
            <Text>日期：{todayString()}</Text>
          </View>
        </View>

        {/* ── System Checked Section ── */}
        <View style={styles.sectionHeader}>
          <Text>系統已檢查 {ruleStats.totalRules} 條規則（不需要再看）</Text>
        </View>

        {categoryStats.map((cat) => (
          <View key={cat.label} style={styles.ruleRow}>
            <Text style={styles.ruleCategory}>{cat.label}</Text>
            <Text style={styles.ruleCount}>
              {cat.alerts + cat.overridden} 項檢查
            </Text>
            <Text
              style={[
                styles.ruleStatus,
                cat.alerts === 0 ? styles.passedText : {},
              ]}
            >
              {cat.alerts === 0 && cat.overridden === 0
                ? '全部通過'
                : cat.alerts === 0 && cat.overridden > 0
                  ? `${cat.overridden} 項提醒已處理`
                  : `${cat.alerts} 項未處理`}
            </Text>
          </View>
        ))}

        <View style={styles.ruleRow}>
          <Text style={styles.ruleCategory}>工項描述完整度</Text>
          <Text style={styles.ruleCount}>
            {clarityStats.filled}/{clarityStats.total} 項已填寫含/不含
          </Text>
          <Text
            style={[
              styles.ruleStatus,
              clarityStats.filled === clarityStats.total
                ? styles.passedText
                : {},
            ]}
          >
            {clarityStats.filled === clarityStats.total
              ? '全部完成'
              : `${clarityStats.total - clarityStats.filled} 項未填`}
          </Text>
        </View>

        {/* ── Override Records ── */}
        {overrides.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text>設計師覆寫紀錄</Text>
            </View>
            {overrides.map((ov, idx) => (
              <View key={ov.ruleId} style={styles.overrideEntry}>
                <Text style={styles.overrideTitle}>
                  {idx + 1}. {ov.alertTitle || ov.ruleId}
                </Text>
                <Text style={styles.overrideReason}>
                  覆寫原因：{ov.reason}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Unresolved Alerts ── */}
        {alerts.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text>未處理的提醒</Text>
            </View>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertEntry}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertWhy}>{alert.why}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Needs Your Judgment ── */}
        <View style={styles.judgmentBlock}>
          <Text style={styles.judgmentHeader}>需要您判斷</Text>
          <Text style={styles.judgmentIntro}>
            以下項目超出系統檢查範圍，需要資深設計師確認：
          </Text>

          <View style={styles.judgmentItem}>
            <Text style={styles.judgmentItemTitle}>1. 預算配置</Text>
            <Text style={styles.judgmentItemDetail}>
              報價總額 {formatCurrency(totalAmount)}
              {siteCondition.clientBudget && siteCondition.clientBudget > 0
                ? `，客戶預算 ${formatCurrency(siteCondition.clientBudget)}`
                : ''}
            </Text>
            {budgetGap !== null && (
              <Text style={styles.judgmentItemDetail}>
                餘裕：{budgetGap}%
              </Text>
            )}
            <Text style={styles.judgmentItemArrow}>
              -{'>'} 各工種配比是否合理？
            </Text>
          </View>

          <View style={styles.judgmentItem}>
            <Text style={styles.judgmentItemTitle}>2. 工法選擇</Text>
            <Text style={styles.judgmentItemArrow}>
              -{'>'} 是否符合現場條件與客戶期望？
            </Text>
          </View>

          <View style={styles.judgmentItem}>
            <Text style={styles.judgmentItemTitle}>3. 特殊需求</Text>
            <Text style={styles.judgmentItemArrow}>
              -{'>'} 客戶是否有系統無法檢查的特殊要求？
            </Text>
          </View>

          <View style={styles.judgmentItem}>
            <Text style={styles.judgmentItemTitle}>4. 工班安排</Text>
            <Text style={styles.judgmentItemArrow}>
              -{'>'} 工期與工班配合是否可行？
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerDivider} />
        <Text style={styles.footer}>Q-Check 風險管理系統</Text>
        <Text style={styles.footerWarning}>
          此報告為內部使用，請勿提供給客戶
        </Text>
      </Page>
    </Document>
  );
}
