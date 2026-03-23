import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
    // Set site condition
    store.setSiteCondition(siteCondition);
    store.setProjectType(projectType);

    // Clear existing items and add parsed ones
    store.clearItems();
    store.addItems(quotationItems);

    // Navigate to quotation page
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

  const severityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '[嚴重]';
      case 'warning':
        return '[警告]';
      case 'info':
        return '[提示]';
      default:
        return '';
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return '';
    }
  };

  // --- UPLOAD MODE ---
  if (mode === 'upload') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold">上傳報價單檢查</h2>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 hover:border-muted-foreground/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragOver ? '放開以上傳檔案' : '拖拉 PDF 至此處'}
            </p>
            <p className="text-sm text-muted-foreground">或點擊選擇檔案</p>
            <p className="text-xs text-muted-foreground">
              支援 PDF 格式，上限 20MB
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              上傳的報價單將透過 Google AI 進行解析，請確認不含機密資料
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

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Site condition form */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            需要填寫現場條件才能完整檢查：
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">坪數</Label>
              <Input
                type="number"
                value={totalArea}
                onChange={(e) => setTotalArea(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">樓層</Label>
              <Input
                type="number"
                value={floorLevel}
                onChange={(e) => setFloorLevel(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={hasElevator}
                onCheckedChange={(checked) =>
                  setHasElevator(checked === true)
                }
              />
              <Label className="text-sm">有電梯</Label>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">屋齡</Label>
              <Input
                type="number"
                value={buildingAge}
                onChange={(e) => setBuildingAge(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">預算（萬）</Label>
            <Input
              type="number"
              value={clientBudget}
              onChange={(e) => setClientBudget(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">案件類型</Label>
            <div className="flex gap-4">
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="projectType"
                    value={opt.value}
                    checked={projectType === opt.value}
                    onChange={() => setProjectType(opt.value)}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
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
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold">解析報價單中...</h2>

        <div className="rounded-lg border bg-card p-8 space-y-4 text-center">
          {/* Progress bar animation */}
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-3 rounded-full animate-pulse"
              style={{ width: '60%', transition: 'width 0.5s ease' }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            正在使用 AI 分析報價單...
          </p>
          <p className="text-sm">
            已上傳：{fileName}
          </p>
        </div>
      </div>
    );
  }

  // --- RESULTS MODE ---
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">檢查結果</h2>

      {/* Summary */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm">
          解析到{' '}
          <span className="font-bold text-base">{parsedItems.length}</span>{' '}
          個工項
        </p>
      </div>

      {/* Risk alerts */}
      {alerts.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">
            風險檢查{' '}
            <Badge variant="destructive">{alerts.length} 項</Badge>
          </h3>
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={`text-sm ${severityColor(alert.severity)}`}
              >
                {severityLabel(alert.severity)} {alert.title}
                {alert.suggestion && (
                  <span className="text-muted-foreground ml-2">
                    — {alert.suggestion}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alerts.length === 0 && parsedItems.length > 0 && (
        <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-800 dark:text-green-200">
          未發現風險項目
        </div>
      )}

      {/* Grouped items */}
      <div className="rounded-lg border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">工項列表（可展開查看）</h3>
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="border rounded">
            <button
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
              onClick={() => toggleCategory(category)}
            >
              <span>
                {CATEGORY_NAMES[category] ?? category} ({items.length} 項)
              </span>
              <span className="text-muted-foreground">
                {expandedCategories.has(category) ? '▼' : '▶'}
              </span>
            </button>
            {expandedCategories.has(category) && (
              <div className="border-t">
                <table className="w-full text-xs">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-3 py-1.5 font-medium">
                        工項名稱
                      </th>
                      <th className="text-center px-2 py-1.5 font-medium w-14">
                        單位
                      </th>
                      <th className="text-right px-2 py-1.5 font-medium w-16">
                        數量
                      </th>
                      <th className="text-right px-2 py-1.5 font-medium w-20">
                        單價
                      </th>
                      <th className="text-right px-3 py-1.5 font-medium w-24">
                        小計
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-1.5">
                          {item.itemName}
                          {item.specification && (
                            <span className="text-muted-foreground ml-1">
                              ({item.specification})
                            </span>
                          )}
                        </td>
                        <td className="text-center px-2 py-1.5 text-muted-foreground">
                          {item.unit}
                        </td>
                        <td className="text-right px-2 py-1.5 tabular-nums">
                          {item.quantity ?? '-'}
                        </td>
                        <td className="text-right px-2 py-1.5 tabular-nums">
                          {item.unitPrice?.toLocaleString('en-US') ?? '-'}
                        </td>
                        <td className="text-right px-3 py-1.5 tabular-nums">
                          {item.totalPrice?.toLocaleString('en-US') ?? '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={handleDownloadReport}
          disabled={downloadingReport}
        >
          {downloadingReport ? '產生中...' : '下載風險檢核報告'}
        </Button>
        <Button onClick={handleImportToEditor}>匯入到報價編輯器</Button>
        <Button variant="ghost" onClick={handleReset}>
          重新上傳
        </Button>
      </div>
    </div>
  );
}
