import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuotationStore } from '@/stores/quotation-store';
import { checkBudgetFeasibility } from '@q-check/construction-knowledge';
import type { ProjectType } from '@q-check/construction-knowledge';

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'new_build', label: '新成屋' },
  { value: 'mid_age', label: '中古屋翻新' },
  { value: 'old_renovation', label: '老屋翻新' },
  { value: 'partial', label: '局部裝修' },
  { value: 'raw', label: '毛胚屋' },
  { value: 'commercial', label: '商業空間' },
  { value: 'retail', label: '專櫃' },
  { value: 'restaurant', label: '餐廳' },
  { value: 'office', label: '辦公大樓' },
];

function formatCurrency(value: number): string {
  return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
}

export default function SiteConditionPage() {
  const { siteCondition, setSiteCondition, projectType, setProjectType, projectName, setProjectName, resetAll } =
    useQuotationStore();
  const navigate = useNavigate();

  const budgetResult = useMemo(() => {
    if (
      siteCondition.totalArea <= 0 ||
      !siteCondition.clientBudget ||
      siteCondition.clientBudget <= 0
    ) {
      return null;
    }

    return checkBudgetFeasibility({
      totalArea: siteCondition.totalArea,
      buildingType: projectType,
      clientBudget: siteCondition.clientBudget * 10000,
    });
  }, [siteCondition.totalArea, siteCondition.clientBudget, projectType]);

  const budgetBorderColor = budgetResult
    ? budgetResult.riskLevel === 'safe'
      ? 'border-l-[#5A8A58]'
      : budgetResult.riskLevel === 'tight'
        ? 'border-l-[#D49028]'
        : 'border-l-[#C44040]'
    : '';

  const budgetBgColor = budgetResult
    ? budgetResult.riskLevel === 'safe'
      ? 'bg-[#F0F7F0]'
      : budgetResult.riskLevel === 'tight'
        ? 'bg-[#FFF8EE]'
        : 'bg-[#FEF2F2]'
    : '';

  const budgetTextColor = budgetResult
    ? budgetResult.riskLevel === 'safe'
      ? 'text-[#5A8A58]'
      : budgetResult.riskLevel === 'tight'
        ? 'text-[#D49028]'
        : 'text-[#C44040]'
    : '';

  const handleStartQuotation = () => {
    void navigate({
      to: '/projects/$projectId/quotation',
      params: { projectId: 'demo' },
    });
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">新建專案</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          在開始報價之前，請填寫案場基本資訊。
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column - Form */}
        <div className="lg:col-span-3 space-y-8">
          {/* Project info section */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">案件資訊</h3>
              <div className="mt-1.5 w-10 h-px bg-border" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-sm text-muted-foreground">案件名稱</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="例：信義區張宅"
                className="border-border bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">案件類型</Label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setProjectType(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      projectType === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Site conditions section */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">現場條件</h3>
              <div className="mt-1.5 w-10 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalArea" className="text-sm text-muted-foreground">總坪數 (坪)</Label>
                <Input
                  id="totalArea"
                  type="number"
                  min="0"
                  max="500"
                  value={siteCondition.totalArea || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSiteCondition({ totalArea: Math.max(0, Math.min(val, 500)) });
                  }}
                  placeholder="例: 30"
                  className="border-border bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorLevel" className="text-sm text-muted-foreground">樓層</Label>
                <Input
                  id="floorLevel"
                  type="number"
                  min="0"
                  max="50"
                  value={siteCondition.floorLevel || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSiteCondition({ floorLevel: Math.max(0, Math.min(val, 50)) });
                  }}
                  placeholder="例: 5"
                  className="border-border bg-card"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildingAge" className="text-sm text-muted-foreground">屋齡 (年)</Label>
                <Input
                  id="buildingAge"
                  type="number"
                  min="0"
                  max="100"
                  value={siteCondition.buildingAge || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSiteCondition({ buildingAge: Math.max(0, Math.min(val, 100)) });
                  }}
                  placeholder="例: 25"
                  className="border-border bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientBudget" className="text-sm text-muted-foreground">客戶預算 (萬元)</Label>
                <Input
                  id="clientBudget"
                  type="number"
                  min="0"
                  max="99999"
                  value={siteCondition.clientBudget ?? ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setSiteCondition({ clientBudget: null });
                      return;
                    }
                    const val = Number(e.target.value);
                    setSiteCondition({ clientBudget: Math.max(0, Math.min(val, 99999)) });
                  }}
                  placeholder="例: 300"
                  className="border-border bg-card"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Checkbox
                id="hasElevator"
                checked={siteCondition.hasElevator}
                onCheckedChange={(checked) =>
                  setSiteCondition({ hasElevator: checked === true })
                }
              />
              <Label htmlFor="hasElevator" className="text-sm text-foreground cursor-pointer">有電梯</Label>
            </div>
          </div>
        </div>

        {/* Right column - Budget result */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            {budgetResult ? (
              <div
                className={`rounded-md border-l-4 ${budgetBorderColor} ${budgetBgColor} p-6 space-y-4`}
                style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground">預算評估</h3>
                  <div className="mt-1.5 w-10 h-px bg-border" />
                </div>
                <p className={`text-sm font-medium ${budgetTextColor}`}>
                  {budgetResult.message}
                </p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>
                    市場行情估算：{formatCurrency(budgetResult.estimatedRange.min)} ~ {formatCurrency(budgetResult.estimatedRange.max)}
                  </p>
                  {budgetResult.gap !== null && (
                    <p className={budgetTextColor}>
                      {budgetResult.gap >= 0 ? '餘裕' : '缺口'}：{formatCurrency(Math.abs(budgetResult.gap))}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="rounded-md border border-border bg-card p-6 text-center"
                style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
              >
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">預算評估</h3>
                  <p className="text-sm text-muted-foreground">
                    填寫坪數與預算後即時評估
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-4 pt-2">
        <button
          onClick={handleStartQuotation}
          disabled={siteCondition.totalArea <= 0}
          className="w-full py-3.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#9A6232] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
        >
          開始報價
        </button>

        <div className="flex justify-center">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              if (window.confirm('確定要清除所有資料嗎？此操作無法復原。')) {
                resetAll();
              }
            }}
          >
            清除所有資料
          </button>
        </div>
      </div>
    </div>
  );
}
