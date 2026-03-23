import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import type { QuotationItem } from '@q-check/construction-knowledge';

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
};

function formatCurrency(value: number): string {
  if (!value || value <= 0) return 'NT$ 0';
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

interface CategorySummary {
  category: string;
  label: string;
  count: number;
  subtotal: number;
  missingClarity: number;
}

function groupByCategory(items: QuotationItem[]): CategorySummary[] {
  const map = new Map<string, CategorySummary>();

  for (const item of items) {
    let group = map.get(item.category);
    if (!group) {
      group = {
        category: item.category,
        label: CATEGORY_NAMES[item.category] ?? item.category,
        count: 0,
        subtotal: 0,
        missingClarity: 0,
      };
      map.set(item.category, group);
    }
    group.count++;
    group.subtotal += item.totalPrice ?? 0;
    if (!item.includes && !item.excludes) {
      group.missingClarity++;
    }
  }

  return Array.from(map.values());
}

export default function ChecklistPage() {
  const navigate = useNavigate();
  const { items, siteCondition, overrides, totalAmount, projectType, projectName } =
    useQuotationStore();
  const alerts = useRiskEngine(items, siteCondition, overrides);

  const categoryGroups = useMemo(() => groupByCategory(items), [items]);

  const criticalWarningCount = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'warning'
  ).length;

  const totalMissingClarity = categoryGroups.reduce(
    (sum, g) => sum + g.missingClarity,
    0
  );

  // Checklist items — only high-level human judgments
  const checklistItems = useMemo(() => {
    const result: { id: string; text: string; why: string }[] = [];

    // 1. Risk check passed
    if (criticalWarningCount > 0) {
      result.push({
        id: 'risk-reviewed',
        text: `風險檢查尚有 ${criticalWarningCount} 項未處理，請先返回處理`,
        why: '嚴重/警告等級的風險必須在風險檢查頁處理後才能繼續',
      });
    } else {
      result.push({
        id: 'risk-reviewed',
        text: '我已確認風險檢查結果',
        why: `共 ${alerts.length} 項風險規則已全部檢視`,
      });
    }

    // 2. Budget alignment (only if budget was set)
    if (siteCondition.clientBudget && siteCondition.clientBudget > 0) {
      const budgetNT = siteCondition.clientBudget * 10000;
      const diff = totalAmount - budgetNT;
      const diffText =
        diff > 0
          ? `超出 ${formatCurrency(diff)}`
          : diff < 0
            ? `低於 ${formatCurrency(Math.abs(diff))}`
            : '剛好符合';
      result.push({
        id: 'budget-alignment',
        text: `報價總額 ${formatCurrency(totalAmount)}，客戶預算 ${formatCurrency(budgetNT)}（${diffText}）`,
        why: '報價與預算差距過大可能導致客戶直接放棄',
      });
    }

    // 3. Final sign-off
    result.push({
      id: 'ready-to-send',
      text: '我已確認這份報價單可以發送',
      why: '確認一切就緒，帶著信心發出去',
    });

    return result;
  }, [alerts, criticalWarningCount, siteCondition.clientBudget, totalAmount]);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    // Block checking risk item if there are unresolved critical/warnings
    if (id === 'risk-reviewed' && criticalWarningCount > 0) return;
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
  const totalCount = checklistItems.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">完成確認</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          最後一步。快速瞄過工項摘要，確認後即可匯出。
        </p>
      </div>

      {/* Project summary bar */}
      <div
        className="rounded-md bg-white p-5 flex items-center gap-6 flex-wrap"
        style={{
          border: '1px solid #E8E4DF',
          boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
        }}
      >
        <div>
          <span className="text-xs text-[#B5B0AA] uppercase tracking-wide">案件</span>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {projectName || '未命名'}
          </p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <span className="text-xs text-[#B5B0AA] uppercase tracking-wide">類型</span>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {PROJECT_TYPE_LABELS[projectType] ?? projectType}
          </p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <span className="text-xs text-[#B5B0AA] uppercase tracking-wide">坪數</span>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {siteCondition.totalArea} 坪
          </p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div>
          <span className="text-xs text-[#B5B0AA] uppercase tracking-wide">工項</span>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {items.length} 項
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-[#B5B0AA] uppercase tracking-wide">總額</span>
          <p className="text-lg font-bold text-primary mt-0.5 tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      {/* Category breakdown table — for senior designers to scan */}
      <div
        className="rounded-md bg-white overflow-hidden"
        style={{
          border: '1px solid #E8E4DF',
          boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
        }}
      >
        <div className="px-5 py-3.5 bg-[#F7F5F2]" style={{ borderBottom: '1px solid #E8E4DF' }}>
          <span className="text-xs font-semibold text-[#8A8580] uppercase tracking-wider">
            工項摘要（按工種）
          </span>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_60px_120px_80px] px-5 py-2.5 text-[11px] font-medium text-[#B5B0AA] uppercase tracking-wider border-b border-[#E8E4DF]">
          <span>工種</span>
          <span className="text-center">項數</span>
          <span className="text-right">小計</span>
          <span className="text-center">含/不含</span>
        </div>

        {/* Rows */}
        {categoryGroups.map((group) => (
          <div
            key={group.category}
            className="grid grid-cols-[1fr_60px_120px_80px] items-center px-5 py-3 border-b border-[#E8E4DF] last:border-b-0 hover:bg-[#FDFCFA] transition-colors"
          >
            <span className="text-sm text-[#2A2A2A] font-medium">{group.label}</span>
            <span className="text-sm text-[#8A8580] text-center tabular-nums">{group.count}</span>
            <span className="text-sm text-[#2A2A2A] text-right tabular-nums">
              {formatCurrency(group.subtotal)}
            </span>
            <span className="text-center">
              {group.missingClarity === 0 ? (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F0F7F0]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#5A8A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              ) : (
                <span className="text-xs text-[#D49028] font-medium">
                  {group.missingClarity} 缺
                </span>
              )}
            </span>
          </div>
        ))}

        {/* Total row */}
        <div
          className="grid grid-cols-[1fr_60px_120px_80px] items-center px-5 py-3.5 bg-[#F7F5F2]"
          style={{ borderTop: '1px solid #E8E4DF' }}
        >
          <span className="text-sm font-semibold text-[#2A2A2A]">合計</span>
          <span className="text-sm font-semibold text-[#2A2A2A] text-center tabular-nums">
            {items.length}
          </span>
          <span className="text-sm font-bold text-primary text-right tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
          <span className="text-center">
            {totalMissingClarity === 0 ? (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#F0F7F0]">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#5A8A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : (
              <span className="text-xs text-[#D49028] font-medium">
                {totalMissingClarity} 缺
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Final checklist — only 2-3 items */}
      <div
        className="rounded-md border border-border bg-card overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
      >
        <div className="px-5 py-3.5 bg-[#F7F5F2]" style={{ borderBottom: '1px solid #E8E4DF' }}>
          <span className="text-xs font-semibold text-[#8A8580] uppercase tracking-wider">
            確認事項
          </span>
        </div>
        {checklistItems.map((item, index) => {
          const isChecked = checkedIds.has(item.id);
          const isBlocked = item.id === 'risk-reviewed' && criticalWarningCount > 0;
          return (
            <div key={item.id}>
              {index > 0 && <div className="mx-5 border-t border-border" />}
              <label
                className={`flex gap-4 items-start px-6 py-5 transition-colors ${
                  isBlocked ? 'opacity-60' : 'cursor-pointer hover:bg-muted/30'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      toggleItem(item.id);
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      isBlocked
                        ? 'border-[#C44040] bg-[#FEF2F2] cursor-not-allowed'
                        : isChecked
                          ? 'bg-primary border-primary cursor-pointer'
                          : 'border-border hover:border-primary/50 cursor-pointer'
                    }`}
                  >
                    {isChecked && !isBlocked && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {isBlocked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke="#C44040" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm leading-relaxed ${
                      isBlocked
                        ? 'text-[#C44040]'
                        : isChecked
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                    }`}
                  >
                    {item.text}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.why}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2 pb-4">
        <button
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={() =>
            navigate({
              to: '/projects/$projectId/risk-check',
              params: { projectId: 'demo' },
            })
          }
        >
          &larr; 返回風險檢查
        </button>
        <button
          disabled={!allChecked}
          onClick={() =>
            navigate({
              to: '/projects/$projectId/export',
              params: { projectId: 'demo' },
            })
          }
          className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-colors ${
            allChecked
              ? 'bg-primary text-primary-foreground hover:bg-[#9A6232] cursor-pointer'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          前往匯出 &rarr;
        </button>
      </div>
    </div>
  );
}
