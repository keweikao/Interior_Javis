import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import type { TradeCategory } from '@q-check/construction-knowledge';

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

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  why: string;
  checked: boolean;
}

function formatCurrency(value: number): string {
  if (!value || value <= 0) return 'NT$ 0';
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { items, siteCondition, overrides, totalAmount } = useQuotationStore();
  const alerts = useRiskEngine(items, siteCondition, overrides);

  const generatedItems = useMemo(() => {
    const result: ChecklistItem[] = [];

    // A. Risk engine alerts
    for (const alert of alerts) {
      result.push({
        id: `risk-${alert.id}`,
        category: '風險確認',
        text: `我已確認：${alert.title}`,
        why: alert.why,
        checked: false,
      });
    }

    // B. Category completeness
    const usedCategories = new Set<TradeCategory>();
    for (const item of items) {
      usedCategories.add(item.category);
    }
    for (const cat of usedCategories) {
      const catName = CATEGORY_NAMES[cat] ?? cat;
      result.push({
        id: `completeness-${cat}`,
        category: '工項完整性',
        text: `我已確認 ${catName} 的工項完整，沒有遺漏`,
        why: `確保${catName}沒有漏報工項，避免後續追加`,
        checked: false,
      });
    }

    // C. Includes/excludes coverage
    const missingCount = items.filter(
      (item) => !item.includes || !item.excludes
    ).length;
    if (missingCount > 0) {
      result.push({
        id: 'includes-excludes',
        category: '描述清晰度',
        text: `我已確認所有工項的「含/不含」欄位都已填寫（目前有 ${missingCount} 項未填）`,
        why: '含/不含寫清楚可避免與客戶的認知落差',
        checked: false,
      });
    }

    // D. Budget alignment
    if (siteCondition.clientBudget && siteCondition.clientBudget > 0) {
      result.push({
        id: 'budget-alignment',
        category: '預算',
        text: `我已確認報價總額 ${formatCurrency(totalAmount)} 與客戶預算 ${formatCurrency(siteCondition.clientBudget)} 的差距可接受`,
        why: '報價與預算差距過大可能導致客戶直接放棄',
        checked: false,
      });
    }

    // E. Fixed items
    result.push({
      id: 'fixed-quantity-price',
      category: '最終確認',
      text: '我已確認所有數量與單價正確',
      why: '數量與單價是報價的基礎，錯誤會直接影響金額',
      checked: false,
    });
    result.push({
      id: 'fixed-site-condition',
      category: '最終確認',
      text: '我已確認現場條件（坪數、樓層、電梯）填寫正確',
      why: '現場條件影響風險判斷的準確性',
      checked: false,
    });
    result.push({
      id: 'fixed-ready-to-send',
      category: '最終確認',
      text: '我已確認報價單可以發送給客戶/工班',
      why: '這是最後一道防線，確認一切就緒',
      checked: false,
    });

    return result;
  }, [alerts, items, siteCondition.clientBudget, totalAmount]);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const checkedCount = checkedIds.size;
  const totalCount = generatedItems.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;

  // Group items by category, preserving insertion order
  const grouped = useMemo(() => {
    const groups: { category: string; items: ChecklistItem[] }[] = [];
    for (const item of generatedItems) {
      let group = groups.find((g) => g.category === item.category);
      if (!group) {
        group = { category: item.category, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [generatedItems]);

  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">完成確認</h2>
        <p className="text-sm text-muted-foreground mt-1">
          在匯出報價單之前，請逐項確認以下事項。全部確認後才能前往匯出。
        </p>
      </div>

      {/* Checklist groups */}
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.category} className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">
              {group.category}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isChecked = checkedIds.has(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex gap-3 items-start rounded-lg border bg-card px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm ${isChecked ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                      >
                        {item.text}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.why}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            已確認 {checkedCount}/{totalCount} 項
          </span>
          {allChecked && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              全部確認完成
            </span>
          )}
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2 pb-4">
        <button
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() =>
            navigate({
              to: '/projects/$projectId/quotation',
              params: { projectId: 'demo' },
            })
          }
        >
          &larr; 返回報價編輯
        </button>
        <Button
          size="lg"
          disabled={!allChecked}
          onClick={() =>
            navigate({
              to: '/projects/$projectId/export',
              params: { projectId: 'demo' },
            })
          }
        >
          前往匯出 &rarr;
        </Button>
      </div>
    </div>
  );
}
