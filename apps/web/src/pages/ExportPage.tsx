import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { pdf } from '@react-pdf/renderer';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import { QuotationPDF } from '@/components/QuotationPDF';
import { RiskReportPDF } from '@/components/RiskReportPDF';
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">匯出文件</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          報價單已完成確認，選擇要匯出的文件。
        </p>
      </div>

      {/* Summary bar */}
      <div
        className="rounded-md border border-border bg-card px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm"
        style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
      >
        <span className="font-medium text-foreground">{projectName}</span>
        <span className="text-muted-foreground">{PROJECT_TYPE_LABELS[projectType] ?? projectType}</span>
        <span className="text-muted-foreground">{siteCondition.totalArea} 坪</span>
        <span className="text-muted-foreground">{validItems.length} 項</span>
        <span className="ml-auto font-semibold text-foreground text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Warning alerts */}
      {warningAlerts.length > 0 && (
        <div
          className="rounded-md border border-[#D49028]/30 bg-[#FFF8EE] px-6 py-4 space-y-2"
        >
          <h3 className="text-sm font-semibold text-[#D49028]">
            風險提醒 ({warningAlerts.length} 項警告尚未處理)
          </h3>
          <ul className="space-y-1 text-sm text-[#8A6A20]">
            {warningAlerts.map((alert) => (
              <li key={alert.id}>- {alert.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* No items warning */}
      {validItems.length === 0 && (
        <div className="rounded-md border border-[#C44040]/30 bg-[#FEF2F2] px-6 py-4 text-sm text-[#C44040]">
          尚無有效工項，請先返回報價編輯頁面新增工項。
        </div>
      )}

      {/* Two export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quotation PDF card */}
        <div
          className="rounded-md border border-border bg-card p-6 flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
        >
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">報價單</h3>
              <div className="mt-1.5 w-8 h-px bg-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              提供給客戶的正式報價文件，包含工項明細與金額。
            </p>
          </div>
          <button
            onClick={handleDownloadQuotation}
            disabled={downloadingQuotation || validItems.length === 0}
            className="mt-6 w-full py-3 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#9A6232] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {downloadingQuotation ? '產生中...' : '下載報價單 PDF'}
          </button>
        </div>

        {/* Risk Report card */}
        <div
          className="rounded-md border border-[#4A7FA5]/20 bg-[#F8FAFC] p-6 flex flex-col"
          style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
        >
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">風險檢核報告</h3>
              <div className="mt-1.5 w-8 h-px bg-[#4A7FA5]" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              提供給資深設計師的內部檢核文件。系統已檢查 {ruleStats.totalRules} 條規則。
            </p>
          </div>
          <button
            onClick={handleDownloadReport}
            disabled={downloadingReport || validItems.length === 0}
            className="mt-6 w-full py-3 rounded-md text-sm font-semibold border-2 border-[#4A7FA5]/30 text-[#4A7FA5] bg-transparent hover:bg-[#4A7FA5]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {downloadingReport ? '產生中...' : '下載風險檢核報告'}
          </button>
        </div>
      </div>

      {/* Back link */}
      <button
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() =>
          navigate({
            to: '/projects/$projectId/checklist',
            params: { projectId: 'demo' },
          })
        }
      >
        &larr; 返回完成確認
      </button>
    </div>
  );
}
