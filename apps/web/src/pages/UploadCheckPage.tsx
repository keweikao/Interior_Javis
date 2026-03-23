import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { pdf } from '@react-pdf/renderer';
import { useQuotationStore } from '@/stores/quotation-store';
import { runRiskEngine } from '@q-check/construction-knowledge';
import {
  dependencyRules,
  siteConflictRules,
  quantityRules,
} from '@q-check/construction-knowledge';
import { RiskReportPDF } from '@/components/RiskReportPDF';
import { parseQuotationPDF } from '@/lib/gemini-parse';
import { logUncategorizedItems } from '@/lib/uncategorized-log';
import type { ParsedItem } from '@/lib/gemini-parse';
import type {
  QuotationItem,
  ProjectType,
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

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'mid_age', label: '中古屋' },
  { value: 'old_renovation', label: '老屋' },
  { value: 'new_build', label: '新成屋' },
  { value: 'partial', label: '局部裝修' },
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

type PageMode = 'upload' | 'loading' | 'results';

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

const SEVERITY_CONFIG = {
  critical: {
    label: '嚴重',
    borderColor: '#C44040',
    bgColor: '#FEF2F2',
    textColor: '#C44040',
  },
  warning: {
    label: '警告',
    borderColor: '#D49028',
    bgColor: '#FFF8EE',
    textColor: '#D49028',
  },
  info: {
    label: '提示',
    borderColor: '#4A7FA5',
    bgColor: '#F0F6FA',
    textColor: '#4A7FA5',
  },
} as const;

export default function UploadCheckPage() {
  const navigate = useNavigate();
  const store = useQuotationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload mode state
  const [mode, setMode] = useState<PageMode>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Site condition form state
  const [totalArea, setTotalArea] = useState(30);
  const [floorLevel, setFloorLevel] = useState(5);
  const [hasElevator, setHasElevator] = useState(false);
  const [buildingAge, setBuildingAge] = useState(25);
  const [clientBudget, setClientBudget] = useState(300);
  const [projectType, setProjectType] = useState<ProjectType>('mid_age');

  // Results mode state
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Risk engine on parsed items
  const quotationItems = useMemo(
    () => parsedItems.map((item, i) => parsedItemToQuotationItem(item, i)),
    [parsedItems]
  );

  const siteCondition = useMemo(
    () => ({
      totalArea,
      floorLevel,
      hasElevator,
      buildingType: projectType,
      buildingAge,
      clientBudget: clientBudget ? clientBudget * 10000 : null,
    }),
    [totalArea, floorLevel, hasElevator, projectType, buildingAge, clientBudget]
  );

  const alerts = useMemo(() => {
    if (quotationItems.length === 0 || totalArea <= 0) return [];
    return runRiskEngine({
      items: quotationItems,
      siteCondition,
      overrides: [],
    });
  }, [quotationItems, siteCondition]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, ParsedItem[]> = {};
    for (const item of parsedItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [parsedItems]);

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return '僅支援 PDF 格式檔案';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '檔案大小超過 20MB 限制';
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setFileName(file.name);
      setMode('loading');

      try {
        const result = await parseQuotationPDF(file);
        setParsedItems(result.items);
        logUncategorizedItems(result.items);
        setMode('results');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '解析失敗，請稍後再試';
        setError(message);
        setMode('upload');
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const handleImportToEditor = () => {
    store.setSiteCondition(siteCondition);
    store.setProjectType(projectType);
    store.clearItems();
    store.addItems(quotationItems);
    navigate({
      to: '/projects/$projectId/quotation',
      params: { projectId: 'demo' },
    });
  };

  const handleReset = () => {
    setMode('upload');
    setParsedItems([]);
    setFileName('');
    setError(null);
    setExpandedCategories(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const totalRules =
        dependencyRules.length +
        siteConflictRules.length +
        quantityRules.length;
      const triggeredRules = alerts.length;
      const ruleStats = {
        totalRules,
        passedRules: totalRules - triggeredRules,
        triggeredRules,
        overriddenRules: 0,
      };

      const blob = await pdf(
        <RiskReportPDF
          projectName={fileName.replace('.pdf', '')}
          projectType={projectType}
          siteCondition={siteCondition}
          items={quotationItems}
          totalAmount={quotationItems.reduce(
            (sum, i) => sum + (i.totalPrice ?? 0),
            0
          )}
          alerts={alerts}
          overrides={[]}
          ruleStats={ruleStats}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `風險檢核報告_${fileName.replace('.pdf', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Risk report PDF generation failed:', err);
    } finally {
      setDownloadingReport(false);
    }
  };

  // --- UPLOAD MODE ---
  if (mode === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        <h2 className="text-xl font-semibold text-[#2A2A2A] tracking-tight">
          上傳報價單檢查
        </h2>

        {/* Drop zone */}
        <div
          className="rounded-md cursor-pointer transition-all duration-200"
          style={{
            border: dragOver ? '2px dashed #B8763E' : '2px dashed #E8E4DF',
            backgroundColor: dragOver ? '#FFF8EE' : '#FFFFFF',
            boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center py-14 px-6 space-y-3">
            {/* Document icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: '#F7F5F2' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="#B8763E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2V8H20"
                  stroke="#B8763E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 13H8"
                  stroke="#B8763E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17H8"
                  stroke="#B8763E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9H8"
                  stroke="#B8763E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-[#2A2A2A]">
              {dragOver ? '放開以上傳檔案' : '拖拉 PDF 至此處'}
            </p>
            <p className="text-sm text-[#8A8580]">或點擊選擇檔案</p>
            <p className="text-xs text-[#B5B0AA]">
              支援 PDF 格式，上限 20MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-[#B5B0AA] text-center leading-relaxed">
          上傳的報價單將透過 Google AI 進行解析，請確認不含機密資料
        </p>

        {error && (
          <div
            className="rounded-md p-4 text-sm"
            style={{
              border: '1px solid #C44040',
              backgroundColor: '#FEF2F2',
              color: '#C44040',
            }}
          >
            {error}
          </div>
        )}

        {/* Site condition form */}
        <div
          className="rounded-md p-6 space-y-5"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E4DF',
            boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
          }}
        >
          <p className="text-sm text-[#8A8580]">
            需要填寫現場條件才能完整檢查：
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]">
                坪數
              </label>
              <input
                type="number"
                value={totalArea}
                onChange={(e) => setTotalArea(Number(e.target.value))}
                className="w-full h-9 text-sm px-3 rounded bg-white"
                style={{ border: '1px solid #E8E4DF' }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]">
                樓層
              </label>
              <input
                type="number"
                value={floorLevel}
                onChange={(e) => setFloorLevel(Number(e.target.value))}
                className="w-full h-9 text-sm px-3 rounded bg-white"
                style={{ border: '1px solid #E8E4DF' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={() => setHasElevator(!hasElevator)}
                className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  borderColor: hasElevator ? '#B8763E' : '#E8E4DF',
                  backgroundColor: hasElevator ? '#B8763E' : '#FFFFFF',
                }}
              >
                {hasElevator && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6L5.5 8.5L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-[#2A2A2A]">有電梯</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]">
                屋齡
              </label>
              <input
                type="number"
                value={buildingAge}
                onChange={(e) => setBuildingAge(Number(e.target.value))}
                className="w-full h-9 text-sm px-3 rounded bg-white"
                style={{ border: '1px solid #E8E4DF' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]">
              預算（萬）
            </label>
            <input
              type="number"
              value={clientBudget}
              onChange={(e) => setClientBudget(Number(e.target.value))}
              className="w-full h-9 text-sm px-3 rounded bg-white"
              style={{ border: '1px solid #E8E4DF' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-widest text-[#B5B0AA]">
              案件類型
            </label>
            <div className="flex gap-2">
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setProjectType(opt.value)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer
                    transition-all duration-150
                    ${projectType === opt.value
                      ? 'bg-[#B8763E] text-white'
                      : 'bg-[#F7F5F2] text-[#8A8580] hover:bg-[#F0EDE8] hover:text-[#2A2A2A]'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LOADING MODE ---
  if (mode === 'loading') {
    return (
      <div className="max-w-2xl mx-auto py-4">
        <div
          className="rounded-md p-12 flex flex-col items-center justify-center space-y-6"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E4DF',
            boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
          }}
        >
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full border-2 border-[#E8E4DF]"
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
              style={{
                borderTopColor: '#B8763E',
              }}
            />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-base font-semibold text-[#2A2A2A]">
              解析報價單中
            </h3>

            {/* Progress bar */}
            <div className="w-64 h-1.5 rounded-full overflow-hidden bg-[#F0EDE8]">
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  width: '60%',
                  backgroundColor: '#B8763E',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            <p className="text-sm text-[#8A8580]">
              正在使用 AI 分析報價單...
            </p>
            <p className="text-xs text-[#B5B0AA]">
              {fileName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RESULTS MODE ---
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 py-4">
      <h2 className="text-xl font-semibold text-[#2A2A2A] tracking-tight">
        檢查結果
      </h2>

      {/* Summary bar */}
      <div
        className="rounded-md p-5 flex items-center gap-6"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E4DF',
          boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
        }}
      >
        <div>
          <span className="text-2xl font-bold text-[#2A2A2A] tabular-nums">{parsedItems.length}</span>
          <span className="text-sm text-[#8A8580] ml-1.5">個工項</span>
        </div>
        <div className="w-px h-8 bg-[#E8E4DF]" />
        <div>
          <span className="text-2xl font-bold tabular-nums" style={{ color: alerts.length > 0 ? '#C44040' : '#5A8A58' }}>
            {alerts.length}
          </span>
          <span className="text-sm text-[#8A8580] ml-1.5">項風險</span>
        </div>
        {alerts.length > 0 && (
          <>
            <div className="w-px h-8 bg-[#E8E4DF]" />
            <div className="flex gap-2">
              {criticalCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: '#FEF2F2', color: '#C44040' }}
                >
                  嚴重 {criticalCount}
                </span>
              )}
              {warningCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: '#FFF8EE', color: '#D49028' }}
                >
                  警告 {warningCount}
                </span>
              )}
              {infoCount > 0 && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: '#F0F6FA', color: '#4A7FA5' }}
                >
                  提示 {infoCount}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Risk alerts */}
      {alerts.length > 0 && (
        <div
          className="rounded-md p-5 space-y-3"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E4DF',
            boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
          }}
        >
          <h3 className="text-sm font-semibold text-[#2A2A2A]">
            風險檢查
          </h3>
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info;
              return (
                <div
                  key={alert.id}
                  className="rounded-md p-4"
                  style={{
                    borderLeft: `3px solid ${config.borderColor}`,
                    backgroundColor: config.bgColor,
                  }}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                      style={{
                        backgroundColor: config.borderColor,
                        color: '#FFFFFF',
                      }}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm font-medium text-[#2A2A2A]">
                      {alert.title}
                    </span>
                  </div>
                  {alert.suggestion && (
                    <p className="text-xs text-[#8A8580] mt-1 ml-[calc(1.5rem+0.5rem)]">
                      {alert.suggestion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length === 0 && parsedItems.length > 0 && (
        <div
          className="rounded-md p-4 text-sm font-medium"
          style={{
            border: '1px solid #5A8A58',
            backgroundColor: '#F0F7F0',
            color: '#5A8A58',
          }}
        >
          未發現風險項目
        </div>
      )}

      {/* Grouped items */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#2A2A2A]">工項列表</h3>
        {Object.entries(groupedItems).map(([category, items]) => (
          <div
            key={category}
            className="rounded-md overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8E4DF',
              boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
            }}
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#2A2A2A] hover:bg-[#FDFCFA] transition-colors cursor-pointer"
              style={{ borderLeft: '3px solid #B8763E', backgroundColor: '#F7F5F2' }}
              onClick={() => toggleCategory(category)}
            >
              <span>
                {CATEGORY_NAMES[category] ?? category}
                <span className="text-[#8A8580] font-normal ml-2">
                  ({items.length} 項)
                </span>
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform duration-150 ${expandedCategories.has(category) ? 'rotate-90' : ''}`}
              >
                <path
                  d="M4.5 3L7.5 6L4.5 9"
                  stroke="#8A8580"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {expandedCategories.has(category) && (
              <div style={{ borderTop: '1px solid #E8E4DF' }}>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_50px_60px_80px_90px] px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-[#B5B0AA] bg-[#FDFCFA]">
                  <span>工項名稱</span>
                  <span className="text-center">單位</span>
                  <span className="text-right">數量</span>
                  <span className="text-right">單價</span>
                  <span className="text-right">小計</span>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_50px_60px_80px_90px] items-center px-4 py-2 text-xs border-t border-[#E8E4DF] hover:bg-[#FDFCFA]"
                  >
                    <span className="text-[#2A2A2A] truncate">
                      {item.itemName}
                      {item.specification && (
                        <span className="text-[#B5B0AA] ml-1">
                          ({item.specification})
                        </span>
                      )}
                    </span>
                    <span className="text-center text-[#8A8580]">
                      {item.unit}
                    </span>
                    <span className="text-right tabular-nums text-[#2A2A2A]">
                      {item.quantity ?? '-'}
                    </span>
                    <span className="text-right tabular-nums text-[#2A2A2A]">
                      {item.unitPrice?.toLocaleString('en-US') ?? '-'}
                    </span>
                    <span className="text-right tabular-nums text-[#2A2A2A]">
                      {item.totalPrice?.toLocaleString('en-US') ?? '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap pt-2 pb-6">
        <button
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          className="
            px-4 py-2.5 rounded-md text-sm font-medium
            border border-[#B8763E] text-[#B8763E]
            hover:bg-[#B8763E] hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150 cursor-pointer
          "
        >
          {downloadingReport ? '產生中...' : '下載風險檢核報告'}
        </button>
        <button
          onClick={handleImportToEditor}
          className="
            px-4 py-2.5 rounded-md text-sm font-semibold
            bg-[#B8763E] text-white
            hover:bg-[#9A6232]
            transition-all duration-150 cursor-pointer
          "
        >
          匯入到報價編輯器
        </button>
        <button
          onClick={handleReset}
          className="
            px-4 py-2.5 rounded-md text-sm font-medium
            text-[#8A8580] hover:text-[#2A2A2A] hover:bg-[#F7F5F2]
            transition-all duration-150 cursor-pointer
          "
        >
          重新上傳
        </button>
      </div>
    </div>
  );
}
