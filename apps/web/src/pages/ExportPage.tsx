import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import { QuotationPDF } from '@/components/QuotationPDF';
import { RiskReportPDF } from '@/components/RiskReportPDF';
import type { TradeCategory } from '@q-check/construction-knowledge';
import {
  dependencyRules,
  siteConflictRules,
  quantityRules,
} from '@q-check/construction-knowledge';

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

export default function ExportPage() {
  const navigate = useNavigate();
  const { items, siteCondition, projectType, totalAmount, overrides } =
    useQuotationStore();
  const alerts = useRiskEngine(items, siteCondition, overrides);
  const [downloadingQuotation, setDownloadingQuotation] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const projectName = useQuotationStore((s) => s.projectName) || '未命名案件';

  // Stats
  const validItems = items.filter((i) => !!i.itemName);
  const categories = new Set<TradeCategory>(validItems.map((i) => i.category));
  const warningAlerts = alerts.filter(
    (a) => a.severity === 'warning' || a.severity === 'critical'
  );

  // Rule stats for risk report
  const totalRules =
    dependencyRules.length + siteConflictRules.length + quantityRules.length;
  const triggeredRules = alerts.length + overrides.length;
  const ruleStats = {
    totalRules,
    passedRules: totalRules - triggeredRules,
    triggeredRules,
    overriddenRules: overrides.length,
  };

  async function handleDownloadQuotation() {
    setDownloadingQuotation(true);
    try {
      const blob = await pdf(
        <QuotationPDF
          projectName={projectName}
          siteCondition={siteCondition}
          projectType={projectType}
          items={items}
          totalAmount={totalAmount}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `報價單_${projectName}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloadingQuotation(false);
    }
  }

  async function handleDownloadReport() {
    setDownloadingReport(true);
    try {
      const blob = await pdf(
        <RiskReportPDF
          projectName={projectName}
          projectType={projectType}
          siteCondition={siteCondition}
          items={items}
          totalAmount={totalAmount}
          alerts={alerts}
          overrides={overrides}
          ruleStats={ruleStats}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `風險檢核報告_${projectName}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Risk report PDF generation failed:', err);
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold">匯出文件</h2>

      {/* Summary card */}
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-base">報價摘要</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-muted-foreground">案場</div>
          <div>{projectName}</div>

          <div className="text-muted-foreground">類型</div>
          <div>{PROJECT_TYPE_LABELS[projectType] ?? projectType}</div>

          <div className="text-muted-foreground">坪數</div>
          <div>{siteCondition.totalArea} 坪</div>

          <div className="text-muted-foreground">工項數</div>
          <div>{validItems.length} 項</div>

          <div className="text-muted-foreground">工種數</div>
          <div>{categories.size} 類</div>

          <div className="text-muted-foreground">總金額</div>
          <div className="font-bold text-base">
            {formatCurrency(totalAmount)}
          </div>
        </div>
      </div>

      {/* Risk alerts */}
      {warningAlerts.length > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 p-6 space-y-3">
          <h3 className="font-semibold text-base">
            風險提醒 ({warningAlerts.length} 項警告尚未處理)
          </h3>
          <ul className="space-y-1 text-sm">
            {warningAlerts.map((alert) => (
              <li key={alert.id} className="text-yellow-800 dark:text-yellow-200">
                - {alert.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No items warning */}
      {validItems.length === 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-6 text-sm text-red-800 dark:text-red-200">
          尚無有效工項，請先返回報價編輯頁面新增工項。
        </div>
      )}

      {/* Download buttons */}
      <div className="grid grid-cols-1 gap-4">
        {/* Quotation PDF */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-base">報價單 PDF</h3>
            <p className="text-sm text-muted-foreground mt-1">
              提供給客戶的正式報價文件，包含工項明細與金額。
            </p>
          </div>
          <Button
            size="lg"
            className="w-full text-base py-6"
            onClick={handleDownloadQuotation}
            disabled={downloadingQuotation || validItems.length === 0}
          >
            {downloadingQuotation ? '產生中...' : '下載報價單 PDF'}
          </Button>
        </div>

        {/* Risk Report PDF */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/10 dark:border-blue-800 p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-base">風險檢核報告</h3>
            <p className="text-sm text-muted-foreground mt-1">
              提供給資深設計師的內部檢核文件。系統已檢查 {ruleStats.totalRules} 條規則，
              資深設計師只需確認系統無法判斷的項目。
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base py-6 border-blue-300 dark:border-blue-700"
            onClick={handleDownloadReport}
            disabled={downloadingReport || validItems.length === 0}
          >
            {downloadingReport ? '產生中...' : '下載風險檢核報告'}
          </Button>
        </div>
      </div>

      {/* Back link */}
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
    </div>
  );
}
