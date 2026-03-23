import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import { RiskAlertPanel } from '@/components/RiskAlertPanel';
import { OverrideDialog } from '@/components/OverrideDialog';
import { getTemplatesByType } from '@q-check/construction-knowledge';
import type {
  TradeCategory,
  QuotationItem,
  RiskAlert,
  TemplateItem,
} from '@q-check/construction-knowledge';

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

const ALL_CATEGORIES: { value: TradeCategory; label: string }[] = [
  { value: 'protection', label: '保護' },
  { value: 'demolition', label: '拆除' },
  { value: 'plumbing', label: '水電' },
  { value: 'masonry', label: '泥作' },
  { value: 'waterproofing', label: '防水' },
  { value: 'carpentry', label: '木作' },
  { value: 'painting', label: '油漆' },
  { value: 'flooring', label: '地板' },
  { value: 'cabinet', label: '系統櫃' },
  { value: 'hvac', label: '空調' },
  { value: 'cleaning', label: '清潔' },
  { value: 'transport', label: '搬運' },
];

const ALL_CATEGORY_OPTIONS: { value: TradeCategory; label: string }[] = [
  { value: 'protection', label: '保護工程' },
  { value: 'demolition', label: '拆除工程' },
  { value: 'plumbing', label: '水電工程' },
  { value: 'masonry', label: '泥作工程' },
  { value: 'waterproofing', label: '防水工程' },
  { value: 'carpentry', label: '木作工程' },
  { value: 'painting', label: '油漆工程' },
  { value: 'flooring', label: '地板工程' },
  { value: 'ceiling', label: '天花板工程' },
  { value: 'cabinet', label: '系統櫃/廚具' },
  { value: 'hvac', label: '空調設備' },
  { value: 'window_door', label: '門窗工程' },
  { value: 'cleaning', label: '清潔工程' },
  { value: 'transport', label: '搬運工程' },
  { value: 'other', label: '其他' },
];

function formatCurrency(value: number): string {
  if (!value || value <= 0) return 'NT$ 0';
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

function templateToItem(template: TemplateItem, index: number) {
  return {
    id: `item-${Date.now()}-${index}`,
    category: template.category,
    itemName: template.itemName,
    unit: template.unit,
    quantity: null,
    unitPrice: null,
    totalPrice: null,
    includes: template.defaultIncludes || null,
    excludes: template.defaultExcludes || null,
    specification: template.description || null,
  };
}

export default function QuotationPage() {
  const store = useQuotationStore();
  const {
    items,
    siteCondition,
    overrides,
    projectType,
    totalAmount,
    addItem,
    addItems,
    updateItem,
    removeItem,
    addOverride,
  } = store;

  const alerts = useRiskEngine(items, siteCondition, overrides);
  const navigate = useNavigate();

  // Local UI state
  const [selectedCategories, setSelectedCategories] = useState<Set<TradeCategory>>(
    new Set(ALL_CATEGORIES.map((c) => c.value))
  );
  const [skeletonLoaded, setSkeletonLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [overrideAlert, setOverrideAlert] = useState<RiskAlert | null>(null);

  const toggleCategory = (cat: TradeCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleLoadSkeleton = () => {
    const categories = Array.from(selectedCategories);
    const templates = getTemplatesByType(projectType, categories);
    const newItems = templates.map((t, i) => templateToItem(t, i));
    addItems(newItems);
    setSkeletonLoaded(true);
    setLoadedCount(newItems.length);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAccept = useCallback((alert: RiskAlert) => {
    setDismissedAlertIds((prev) => new Set(prev).add(alert.id));
  }, []);

  const handleOverride = useCallback((alert: RiskAlert) => {
    setOverrideAlert(alert);
  }, []);

  const handleOverrideSubmit = useCallback(
    (reason: string) => {
      if (overrideAlert) {
        addOverride({ ruleId: overrideAlert.ruleId, reason, alertTitle: overrideAlert.title });
        setDismissedAlertIds((prev) => new Set(prev).add(overrideAlert.id));
        setOverrideAlert(null);
      }
    },
    [overrideAlert, addOverride]
  );

  const handleAddItem = useCallback((category: TradeCategory) => {
    addItem({
      id: `item-${Date.now()}-new`,
      category,
      itemName: '',
      unit: '式',
      quantity: null,
      unitPrice: null,
      totalPrice: null,
      includes: null,
      excludes: null,
      specification: null,
    });
  }, [addItem]);

  // Group items by category, maintaining order
  const groupedItems = items.reduce<
    { category: TradeCategory; items: typeof items }[]
  >((groups, item) => {
    let group = groups.find((g) => g.category === item.category);
    if (!group) {
      group = { category: item.category, items: [] };
      groups.push(group);
    }
    group.items.push(item);
    return groups;
  }, []);

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Skeleton control bar */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {PROJECT_TYPE_LABELS[projectType] ?? projectType}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {store.projectName || '未命名案件'} / {siteCondition.totalArea} 坪
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={selectedCategories.has(cat.value)}
                  onCheckedChange={() => toggleCategory(cat.value)}
                  disabled={skeletonLoaded}
                />
                {cat.label}
              </label>
            ))}
          </div>

          <div>
            {skeletonLoaded ? (
              <Button variant="secondary" disabled>
                已帶入 {loadedCount} 項
              </Button>
            ) : (
              <Button onClick={handleLoadSkeleton}>帶入工項骨架</Button>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        {/* Quotation table */}
        <div className="flex-1 overflow-auto">
          {groupedItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              請先選擇工種並帶入工項骨架
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 px-2 font-medium">工項名稱</th>
                  <th className="py-2 px-2 font-medium w-16 text-center">單位</th>
                  <th className="py-2 px-2 font-medium w-24 text-right">數量</th>
                  <th className="py-2 px-2 font-medium w-28 text-right">單價</th>
                  <th className="py-2 px-2 font-medium w-28 text-right">小計</th>
                  <th className="py-2 px-2 font-medium w-24 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((group) => (
                  <CategoryGroup
                    key={group.category}
                    category={group.category}
                    items={group.items}
                    expandedItems={expandedItems}
                    onToggleExpand={toggleExpand}
                    onUpdateItem={updateItem}
                    onRemoveItem={removeItem}
                    onAddItem={handleAddItem}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Total bar */}
        <div className="border-t bg-card px-4 py-3 flex justify-end items-center gap-4 mt-auto">
          <span className="text-muted-foreground text-sm">總金額:</span>
          <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
          <Button
            variant="default"
            size="sm"
            onClick={() =>
              navigate({
                to: '/projects/$projectId/export',
                params: { projectId: 'demo' },
              })
            }
          >
            匯出報價單
          </Button>
        </div>
      </div>

      {/* Risk panel sidebar */}
      <div className="w-80 shrink-0 border rounded-lg bg-card overflow-hidden">
        <RiskAlertPanel
          alerts={alerts}
          dismissedIds={dismissedAlertIds}
          onAccept={handleAccept}
          onOverride={handleOverride}
        />
      </div>

      {/* Override dialog */}
      <OverrideDialog
        alert={overrideAlert}
        open={overrideAlert !== null}
        onClose={() => setOverrideAlert(null)}
        onSubmit={handleOverrideSubmit}
      />
    </div>
  );
}

// Extracted category group component for the table
function CategoryGroup({
  category,
  items,
  expandedItems,
  onToggleExpand,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
}: {
  category: TradeCategory;
  items: QuotationItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<QuotationItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (category: TradeCategory) => void;
}) {
  return (
    <>
      {/* Category header */}
      <tr className="bg-muted/50">
        <td colSpan={5} className="py-2 px-2 font-semibold text-sm">
          {CATEGORY_NAMES[category] ?? category}
          <span className="text-muted-foreground font-normal ml-2">
            ({items.length} 項)
          </span>
        </td>
        <td className="py-2 px-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onAddItem(category)}
          >
            + 新增
          </Button>
        </td>
      </tr>

      {/* Item rows */}
      {items.map((itm) => (
        <ItemRow
          key={itm.id}
          item={itm}
          expanded={expandedItems.has(itm.id)}
          onToggleExpand={() => onToggleExpand(itm.id)}
          onUpdate={(updates) => onUpdateItem(itm.id, updates)}
          onRemove={() => onRemoveItem(itm.id)}
        />
      ))}
    </>
  );
}

function ItemRow({
  item,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: {
  item: QuotationItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<QuotationItem>) => void;
  onRemove: () => void;
}) {
  const [editingName, setEditingName] = useState(!item.itemName);
  const subtotal = (item.quantity ?? 0) * (item.unitPrice ?? 0);

  return (
    <>
      <tr className="border-b hover:bg-muted/30">
        <td className="py-1.5 px-2">
          <div className="flex items-center gap-1.5">
            <select
              className="h-7 text-xs border rounded px-1 bg-background"
              value={item.category}
              onChange={(e) =>
                onUpdate({ category: e.target.value as TradeCategory })
              }
            >
              {ALL_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {editingName ? (
              <Input
                className="h-7 text-sm flex-1"
                value={item.itemName}
                onChange={(e) => onUpdate({ itemName: e.target.value })}
                onBlur={() => {
                  if (item.itemName) setEditingName(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && item.itemName) setEditingName(false);
                }}
                placeholder="輸入工項名稱..."
                autoFocus
              />
            ) : (
              <span
                className="cursor-pointer hover:underline flex-1 truncate"
                onClick={() => setEditingName(true)}
                title="點擊編輯名稱"
              >
                {item.itemName}
              </span>
            )}
          </div>
        </td>
        <td className="py-1.5 px-2 text-center text-muted-foreground">
          {item.unit}
        </td>
        <td className="py-1.5 px-2">
          <Input
            type="number"
            className="h-7 text-right text-sm w-full"
            value={item.quantity ?? ''}
            onChange={(e) =>
              onUpdate({
                quantity: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="0"
          />
        </td>
        <td className="py-1.5 px-2">
          <Input
            type="number"
            className="h-7 text-right text-sm w-full"
            value={item.unitPrice ?? ''}
            onChange={(e) =>
              onUpdate({
                unitPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="0"
          />
        </td>
        <td className="py-1.5 px-2 text-right tabular-nums">
          {subtotal > 0 ? subtotal.toLocaleString('en-US') : '-'}
        </td>
        <td className="py-1.5 px-2 text-center">
          <div className="flex gap-1 justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onToggleExpand}
            >
              {expanded ? '收合' : '展開'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              刪除
            </Button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b bg-muted/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">規格說明</Label>
                <Textarea
                  className="text-xs min-h-[60px]"
                  value={item.specification ?? ''}
                  onChange={(e) =>
                    onUpdate({ specification: e.target.value || null })
                  }
                  placeholder="規格說明..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">包含項目</Label>
                <Textarea
                  className="text-xs min-h-[60px]"
                  value={item.includes ?? ''}
                  onChange={(e) =>
                    onUpdate({ includes: e.target.value || null })
                  }
                  placeholder="包含項目..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">不包含項目</Label>
                <Textarea
                  className="text-xs min-h-[60px]"
                  value={item.excludes ?? ''}
                  onChange={(e) =>
                    onUpdate({ excludes: e.target.value || null })
                  }
                  placeholder="不包含項目..."
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
