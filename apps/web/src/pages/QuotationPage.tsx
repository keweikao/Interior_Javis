import { useState, useCallback, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import { RiskAlertPanel } from '@/components/RiskAlertPanel';
import { OverrideDialog } from '@/components/OverrideDialog';
import { getTemplatesByType } from '@q-check/construction-knowledge';
import { parseQuotationPDF } from '@/lib/gemini-parse';
import { logUncategorizedItems } from '@/lib/uncategorized-log';
import type { ParsedItem } from '@/lib/gemini-parse';
import type {
  TradeCategory,
  QuotationItem,
  RiskAlert,
  TemplateItem,
} from '@q-check/construction-knowledge';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function parsedItemToQuotationItem(
  item: ParsedItem,
  index: number
): QuotationItem {
  return {
    id: `parsed-${Date.now()}-${index}`,
    category: item.category,
    itemName: item.itemName,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    includes: null,
    excludes: null,
    specification: item.specification,
  };
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
  if (value === 0 || value === null || value === undefined) return 'NT$ 0';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local UI state
  const [selectedCategories, setSelectedCategories] = useState<Set<TradeCategory>>(
    new Set(ALL_CATEGORIES.map((c) => c.value))
  );
  const [skeletonLoaded, setSkeletonLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [overrideAlert, setOverrideAlert] = useState<RiskAlert | null>(null);

  // PDF upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

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

  const handleImportPDF = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setUploadError('僅支援 PDF 格式檔案');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('檔案大小超過 20MB 限制');
        return;
      }

      setUploadError(null);
      setUploading(true);
      try {
        const result = await parseQuotationPDF(file);
        logUncategorizedItems(result.items);
        const newItems = result.items.map((item, i) => parsedItemToQuotationItem(item, i));
        addItems(newItems);
        setImportedCount(newItems.length);
        setSkeletonLoaded(true);
        setLoadedCount(newItems.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : '解析失敗，請稍後再試';
        setUploadError(message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [addItems]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImportPDF(file);
    },
    [handleImportPDF]
  );

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
    <div className="flex gap-6 h-[calc(100vh-5rem)]">
      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Project header */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-[#2A2A2A] tracking-tight">
            {store.projectName || '未命名案件'}
            <span className="text-[#8A8580] font-normal mx-2">/</span>
            <span className="text-[#8A8580] font-normal text-base">
              {PROJECT_TYPE_LABELS[projectType] ?? projectType}
            </span>
            <span className="text-[#8A8580] font-normal mx-2">/</span>
            <span className="text-[#8A8580] font-normal text-base">
              {siteCondition.totalArea} 坪
            </span>
          </h1>
        </div>

        {/* Skeleton control bar */}
        <div
          className="rounded-md bg-white p-5 space-y-4"
          style={{
            border: '1px solid #E8E4DF',
            boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold tracking-wide uppercase text-[#8A8580]"
            >
              工種選擇
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.has(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  disabled={skeletonLoaded}
                  onClick={() => toggleCategory(cat.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer
                    transition-all duration-150
                    ${skeletonLoaded ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isSelected
                      ? 'bg-[#B8763E] text-white'
                      : 'bg-[#F7F5F2] text-[#8A8580] hover:bg-[#F0EDE8] hover:text-[#2A2A2A]'
                    }
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {skeletonLoaded ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded text-xs font-medium text-[#5A8A58] bg-[#F0F7F0]">
                已帶入 {loadedCount} 項{importedCount > 0 ? '（匯入）' : ''}
              </span>
            ) : (
              <>
                <button
                  onClick={handleLoadSkeleton}
                  disabled={uploading}
                  className="
                    px-4 py-2 rounded text-sm font-medium
                    border border-[#B8763E] text-[#B8763E]
                    hover:bg-[#B8763E] hover:text-white
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150 cursor-pointer
                  "
                >
                  帶入工項骨架
                </button>
                <span className="text-xs text-[#B5B0AA]">或</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="
                    px-4 py-2 rounded text-sm font-medium
                    border border-[#8A8580] text-[#8A8580]
                    hover:bg-[#8A8580] hover:text-white
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150 cursor-pointer
                  "
                >
                  {uploading ? '解析中...' : '匯入報價單 (PDF)'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </>
            )}
            {uploadError && (
              <span className="text-xs text-[#C44040]">{uploadError}</span>
            )}
          </div>
        </div>

        {/* Quotation table */}
        <div className="flex-1 overflow-auto mt-5">
          {groupedItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[#B5B0AA] text-sm">
              請先選擇工種並帶入工項骨架
            </div>
          ) : (
            <div className="space-y-4">
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
            </div>
          )}
        </div>

        {/* Total bar - sticky bottom */}
        <div
          className="mt-auto px-5 py-4 flex justify-end items-center gap-5 bg-white"
          style={{
            borderTop: '1px solid #E8E4DF',
            position: 'sticky',
            bottom: 0,
          }}
        >
          <span className="text-sm text-[#8A8580]">總金額</span>
          <span className="text-xl font-bold text-[#B8763E] tabular-nums tracking-tight">
            {formatCurrency(totalAmount)}
          </span>
          <button
            onClick={() =>
              navigate({
                to: '/projects/$projectId/risk-check',
                params: { projectId: 'demo' },
              })
            }
            className="
              px-5 py-2.5 rounded-md text-sm font-semibold
              bg-[#B8763E] text-white
              hover:bg-[#9A6232]
              transition-all duration-150 cursor-pointer
            "
          >
            風險檢查
          </button>
        </div>
      </div>

      {/* Risk panel sidebar */}
      <div
        className="w-80 shrink-0 rounded-md bg-white overflow-hidden flex flex-col"
        style={{
          border: '1px solid #E8E4DF',
          boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
        }}
      >
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

// Extracted category group component
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
    <div
      className="rounded-md bg-white overflow-hidden"
      style={{
        border: '1px solid #E8E4DF',
        boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
      }}
    >
      {/* Category header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-[#F7F5F2]"
        style={{ borderLeft: '3px solid #B8763E' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#2A2A2A]">
            {CATEGORY_NAMES[category] ?? category}
          </span>
          <span className="text-xs text-[#8A8580]">
            {items.length} 項
          </span>
        </div>
        <button
          onClick={() => onAddItem(category)}
          className="
            px-2 py-1 rounded text-xs font-medium
            text-[#8A8580] hover:text-[#B8763E]
            transition-colors duration-150 cursor-pointer
          "
        >
          + 新增
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_60px_80px_100px_100px_80px] px-4 py-2 text-xs font-medium text-[#B5B0AA] uppercase tracking-wider border-b border-[#E8E4DF]">
        <span>工項名稱</span>
        <span className="text-center">單位</span>
        <span className="text-right">數量</span>
        <span className="text-right">單價</span>
        <span className="text-right">小計</span>
        <span className="text-center">操作</span>
      </div>

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
    </div>
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
      <div className="group grid grid-cols-[1fr_60px_80px_100px_100px_80px] items-center px-4 py-2.5 border-b border-[#E8E4DF] last:border-b-0 hover:bg-[#FDFCFA] transition-colors duration-100">
        {/* Item name with category select */}
        <div className="flex items-center gap-2 min-w-0">
          <select
            className="h-7 text-xs border border-[#E8E4DF] rounded px-1.5 bg-white text-[#2A2A2A] focus:border-[#B8763E] focus:ring-0 cursor-pointer"
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
            <input
              className="h-7 text-sm flex-1 min-w-0 border-0 border-b border-[#E8E4DF] bg-transparent px-1 focus:border-[#B8763E] focus:outline-none focus:ring-0"
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
              className="cursor-pointer hover:text-[#B8763E] flex-1 truncate text-sm text-[#2A2A2A]"
              onClick={() => setEditingName(true)}
              title="點擊編輯名稱"
            >
              {item.itemName}
            </span>
          )}
        </div>

        {/* Unit */}
        <span className="text-center text-xs text-[#8A8580]">
          {item.unit}
        </span>

        {/* Quantity */}
        <input
          type="number"
          className="h-7 text-right text-sm w-full bg-transparent border-0 border-b border-transparent hover:border-[#E8E4DF] focus:border-[#B8763E] focus:outline-none focus:ring-0 px-1 tabular-nums"
          min="0"
          max="99999"
          value={item.quantity ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const validated = val !== null ? Math.max(0, Math.min(val, 99999)) : null;
            onUpdate({ quantity: validated });
          }}
          placeholder="0"
        />

        {/* Unit price */}
        <input
          type="number"
          className="h-7 text-right text-sm w-full bg-transparent border-0 border-b border-transparent hover:border-[#E8E4DF] focus:border-[#B8763E] focus:outline-none focus:ring-0 px-1 tabular-nums"
          min="0"
          max="99999999"
          value={item.unitPrice ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const validated = val !== null ? Math.max(0, Math.min(val, 99999999)) : null;
            onUpdate({ unitPrice: validated });
          }}
          placeholder="0"
        />

        {/* Subtotal */}
        <span className="text-right text-sm tabular-nums text-[#2A2A2A]">
          {subtotal > 0 ? subtotal.toLocaleString('en-US') : '-'}
        </span>

        {/* Actions */}
        <div className="flex gap-1 justify-center items-center">
          <button
            onClick={onToggleExpand}
            className="px-1.5 py-0.5 rounded text-xs text-[#B8763E] hover:bg-[#F7F5F2] transition-colors cursor-pointer"
          >
            {expanded ? '收合' : '展開'}
          </button>
          <button
            onClick={onRemove}
            className="px-1.5 py-0.5 rounded text-xs text-[#B5B0AA] opacity-0 group-hover:opacity-100 hover:text-[#C44040] hover:bg-[#FEF2F2] transition-all cursor-pointer"
          >
            刪除
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 py-4 bg-[#FDFAF6] border-b border-[#E8E4DF]">
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-widest text-[#B5B0AA]">
                規格說明
              </label>
              <textarea
                className="w-full text-xs min-h-[68px] p-2.5 rounded bg-white border border-[#E8E4DF] focus:border-[#B8763E] focus:outline-none focus:ring-2 focus:ring-[#B8763E]/15 resize-y"
                value={item.specification ?? ''}
                onChange={(e) =>
                  onUpdate({ specification: e.target.value || null })
                }
                placeholder="規格說明..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-widest text-[#B5B0AA]">
                包含項目
              </label>
              <textarea
                className="w-full text-xs min-h-[68px] p-2.5 rounded bg-white border border-[#E8E4DF] focus:border-[#B8763E] focus:outline-none focus:ring-2 focus:ring-[#B8763E]/15 resize-y"
                value={item.includes ?? ''}
                onChange={(e) =>
                  onUpdate({ includes: e.target.value || null })
                }
                placeholder="包含項目..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-widest text-[#B5B0AA]">
                不包含項目
              </label>
              <textarea
                className="w-full text-xs min-h-[68px] p-2.5 rounded bg-white border border-[#E8E4DF] focus:border-[#B8763E] focus:outline-none focus:ring-2 focus:ring-[#B8763E]/15 resize-y"
                value={item.excludes ?? ''}
                onChange={(e) =>
                  onUpdate({ excludes: e.target.value || null })
                }
                placeholder="不包含項目..."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
