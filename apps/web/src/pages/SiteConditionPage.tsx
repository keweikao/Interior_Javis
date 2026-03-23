import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useQuotationStore } from '@/stores/quotation-store';
import { checkBudgetFeasibility } from '@q-check/construction-knowledge';
import type { ProjectType } from '@q-check/construction-knowledge';

const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'new_build', label: '新成屋' },
  { value: 'mid_age', label: '中古屋翻新' },
  { value: 'old_renovation', label: '老屋翻新' },
  { value: 'partial', label: '局部裝修' },
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

  const budgetColorClass = budgetResult
    ? budgetResult.riskLevel === 'safe'
      ? 'border-green-500 bg-green-50'
      : budgetResult.riskLevel === 'tight'
        ? 'border-amber-500 bg-amber-50'
        : 'border-red-500 bg-red-50'
    : '';

  const budgetTextColor = budgetResult
    ? budgetResult.riskLevel === 'safe'
      ? 'text-green-800'
      : budgetResult.riskLevel === 'tight'
        ? 'text-amber-800'
        : 'text-red-800'
    : '';

  const handleStartQuotation = () => {
    void navigate({
      to: '/projects/$projectId/quotation',
      params: { projectId: 'demo' },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">現場條件與預算檢查</h2>

      <Card>
        <CardHeader>
          <CardTitle>案件資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">案件名稱</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="例：信義區張宅"
            />
          </div>

          <div className="space-y-2">
            <Label>案件類型</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROJECT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors text-sm ${
                    projectType === opt.value
                      ? 'border-foreground bg-muted'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="projectType"
                    value={opt.value}
                    checked={projectType === opt.value}
                    onChange={() => setProjectType(opt.value)}
                    className="accent-foreground"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>現場條件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalArea">總坪數 (坪)</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floorLevel">樓層</Label>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buildingAge">屋齡 (年)</Label>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientBudget">客戶預算 (萬元)</Label>
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
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="hasElevator"
              checked={siteCondition.hasElevator}
              onCheckedChange={(checked) =>
                setSiteCondition({ hasElevator: checked === true })
              }
            />
            <Label htmlFor="hasElevator">有電梯</Label>
          </div>
        </CardContent>
      </Card>

      {budgetResult && (
        <Card className={`border-2 ${budgetColorClass}`}>
          <CardHeader>
            <CardTitle className={budgetTextColor}>預算評估結果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className={`text-sm font-medium ${budgetTextColor}`}>
              {budgetResult.message}
            </p>
            <div className="text-sm text-muted-foreground">
              <p>
                市場行情估算：
                {formatCurrency(budgetResult.estimatedRange.min)} ~{' '}
                {formatCurrency(budgetResult.estimatedRange.max)}
              </p>
              {budgetResult.gap !== null && (
                <p>
                  {budgetResult.gap >= 0 ? '餘裕' : '缺口'}：
                  {formatCurrency(Math.abs(budgetResult.gap))}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleStartQuotation}
        disabled={siteCondition.totalArea <= 0}
      >
        開始報價
      </Button>

      <div className="flex justify-center pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            if (window.confirm('確定要清除所有資料嗎？此操作無法復原。')) {
              resetAll();
            }
          }}
        >
          清除所有資料
        </Button>
      </div>
    </div>
  );
}
