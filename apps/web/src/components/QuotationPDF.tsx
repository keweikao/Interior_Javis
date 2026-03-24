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
  TradeCategory,
} from '@q-check/construction-knowledge';

export interface QuotationPDFProps {
  projectName: string;
  siteCondition: SiteCondition;
  projectType: string;
  items: QuotationItem[];
  totalAmount: number;
}

const CATEGORY_NAMES: Record<string, string> = {
  protection: '保護工程',
  demolition: '拆除工程',
  plumbing: '水電工程',
  masonry: '泥作工程',
  waterproofing: '防水工程',
  carpentry: '木作工程',
  painting: '油漆工程',
  flooring: '地板工程',
  ceiling: '天花板工程',
  cabinet: '系統櫃/廚具',
  hvac: '空調設備',
  window_door: '門窗工程',
  cleaning: '清潔工程',
  transport: '搬運工程',
  other: '其他',
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  new_build: '新成屋',
  mid_age: '中古屋翻新',
  old_renovation: '老屋翻新',
  partial: '局部裝修',
  raw: '毛胚屋',
  commercial: '商業空間',
  retail: '專櫃',
  restaurant: '餐廳',
  office: '辦公大樓',
};

const CHINESE_NUMBERS = [
  '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '十一', '十二', '十三', '十四', '十五',
];

function formatNumber(value: number): string {
  if (!value || value <= 0) return '-';
  return Math.round(value).toLocaleString('en-US');
}

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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 10,
  },
  metaLabel: {
    width: 60,
    color: '#666666',
  },
  metaValue: {
    flex: 1,
  },
  metaConditionRow: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 10,
    gap: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginVertical: 12,
  },
  thickDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 3,
    paddingHorizontal: 4,
    minHeight: 18,
  },
  colName: {
    flex: 3,
    fontSize: 9,
  },
  colUnit: {
    width: 40,
    textAlign: 'center',
    fontSize: 9,
  },
  colQty: {
    width: 50,
    textAlign: 'right',
    fontSize: 9,
  },
  colPrice: {
    width: 70,
    textAlign: 'right',
    fontSize: 9,
  },
  colTotal: {
    width: 80,
    textAlign: 'right',
    fontSize: 9,
  },
  headerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333333',
  },
  includesExcludes: {
    paddingLeft: 16,
    paddingVertical: 2,
    fontSize: 8,
    color: '#666666',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 12,
    color: '#333333',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notes: {
    marginTop: 24,
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.8,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
  },
});

interface GroupedCategory {
  category: TradeCategory;
  items: QuotationItem[];
}

function groupByCategory(items: QuotationItem[]): GroupedCategory[] {
  const groups: GroupedCategory[] = [];
  for (const item of items) {
    if (!item.itemName) continue;
    let group = groups.find((g) => g.category === item.category);
    if (!group) {
      group = { category: item.category, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export function QuotationPDF({
  projectName,
  siteCondition,
  projectType,
  items,
  totalAmount,
}: QuotationPDFProps) {
  const grouped = groupByCategory(items);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>Q-Check 報價單</Text>

        {/* Meta info */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>案場：</Text>
          <Text style={styles.metaValue}>{projectName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>日期：</Text>
          <Text style={styles.metaValue}>{todayString()}</Text>
        </View>
        <View style={styles.metaConditionRow}>
          <Text>
            坪數：{siteCondition.totalArea} 坪
          </Text>
          <Text>
            屋況：{PROJECT_TYPE_LABELS[projectType] ?? projectType}
          </Text>
          <Text>
            樓層：{siteCondition.floorLevel}F{' '}
            {siteCondition.hasElevator ? '有電梯' : '無電梯'}
          </Text>
        </View>

        <View style={styles.thickDivider} />

        {/* Grouped items */}
        {grouped.map((group, gi) => (
          <View key={group.category} wrap={false}>
            <Text style={styles.sectionTitle}>
              {CHINESE_NUMBERS[gi] ?? String(gi + 1)}、
              {CATEGORY_NAMES[group.category] ?? group.category}
            </Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colName, styles.headerText]}>工項名稱</Text>
              <Text style={[styles.colUnit, styles.headerText]}>單位</Text>
              <Text style={[styles.colQty, styles.headerText]}>數量</Text>
              <Text style={[styles.colPrice, styles.headerText]}>單價</Text>
              <Text style={[styles.colTotal, styles.headerText]}>小計</Text>
            </View>

            {/* Rows */}
            {group.items.map((item) => {
              const subtotal =
                (item.quantity ?? 0) * (item.unitPrice ?? 0);
              return (
                <View key={item.id}>
                  <View style={styles.tableRow}>
                    <Text style={styles.colName}>{item.itemName}</Text>
                    <Text style={styles.colUnit}>{item.unit}</Text>
                    <Text style={styles.colQty}>
                      {item.quantity != null ? formatNumber(item.quantity) : '-'}
                    </Text>
                    <Text style={styles.colPrice}>
                      {item.unitPrice != null
                        ? formatNumber(item.unitPrice)
                        : '-'}
                    </Text>
                    <Text style={styles.colTotal}>
                      {subtotal > 0 ? formatNumber(subtotal) : '-'}
                    </Text>
                  </View>
                  {item.specification ? (
                    <Text style={styles.includesExcludes}>
                      規格：{item.specification}
                    </Text>
                  ) : null}
                  {item.includes ? (
                    <Text style={styles.includesExcludes}>
                      含：{item.includes}
                    </Text>
                  ) : null}
                  {item.excludes ? (
                    <Text style={styles.includesExcludes}>
                      不含：{item.excludes}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>總金額：</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        {/* Notes */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>備註：</Text>
          <Text>1. 以上報價不含稅</Text>
          <Text>2. 報價有效期 30 天</Text>
          <Text>3. 「含」與「不含」欄位請詳閱，如有疑問請洽設計師</Text>
          <Text>4. 實際施作數量以現場丈量為準</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>--- Q-Check 報價管理系統 ---</Text>
      </Page>
    </Document>
  );
}
