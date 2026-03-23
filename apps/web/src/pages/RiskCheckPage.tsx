import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuotationStore } from '@/stores/quotation-store';
import { useRiskEngine } from '@/hooks/useRiskEngine';
import { OverrideDialog } from '@/components/OverrideDialog';
import type { RiskAlert } from '@q-check/construction-knowledge';

const SEVERITY_CONFIG = {
  critical: {
    label: '嚴重',
    borderColor: '#C44040',
    bgColor: '#FEF2F2',
    badgeBg: '#C44040',
    badgeText: '#FFFFFF',
    dotColor: '#C44040',
  },
  warning: {
    label: '警告',
    borderColor: '#D49028',
    bgColor: '#FFF8EE',
    badgeBg: '#D49028',
    badgeText: '#FFFFFF',
    dotColor: '#D49028',
  },
  info: {
    label: '建議',
    borderColor: '#4A7FA5',
    bgColor: '#F0F6FA',
    badgeBg: '#4A7FA5',
    badgeText: '#FFFFFF',
    dotColor: '#4A7FA5',
  },
} as const;

export default function RiskCheckPage() {
  const navigate = useNavigate();
  const { items, siteCondition, overrides, addOverride } = useQuotationStore();

  const alerts = useRiskEngine(items, siteCondition, overrides);

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [overrideAlert, setOverrideAlert] = useState<RiskAlert | null>(null);

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));
  const criticalAlerts = visibleAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = visibleAlerts.filter((a) => a.severity === 'warning');
  const infoAlerts = visibleAlerts.filter((a) => a.severity === 'info');

  // Gate 只擋 critical + warning，info（建議）不阻擋前進
  const blockingAlerts = visibleAlerts.filter((a) => a.severity !== 'info');
  const allHandled = blockingAlerts.length === 0;

  const handleAccept = useCallback((alert: RiskAlert) => {
    setDismissedIds((prev) => new Set(prev).add(alert.id));
  }, []);

  const handleOverride = useCallback((alert: RiskAlert) => {
    setOverrideAlert(alert);
  }, []);

  const handleOverrideSubmit = useCallback(
    (reason: string) => {
      if (overrideAlert) {
        addOverride({ ruleId: overrideAlert.ruleId, reason, alertTitle: overrideAlert.title });
        setDismissedIds((prev) => new Set(prev).add(overrideAlert.id));
        setOverrideAlert(null);
      }
    },
    [overrideAlert, addOverride]
  );

  // critical + warning 直接顯示，info 分開收合
  const blockingGroups = [
    { key: 'critical' as const, items: criticalAlerts },
    { key: 'warning' as const, items: warningAlerts },
  ].filter((g) => g.items.length > 0);

  const [showInfoAlerts, setShowInfoAlerts] = useState(false);

  const hasNoItems = items.length === 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">風險檢查</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          報價送出前，請確認所有風險警告已處理。
        </p>
      </div>

      {hasNoItems ? (
        /* Empty state */
        <div
          className="rounded-md border border-border bg-card p-12 text-center"
          style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
        >
          <p className="text-sm text-muted-foreground mb-4">
            尚未建立報價工項，請先完成報價編輯。
          </p>
          <button
            onClick={() =>
              navigate({
                to: '/projects/$projectId/quotation',
                params: { projectId: 'demo' },
              })
            }
            className="px-5 py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#9A6232] transition-colors cursor-pointer"
          >
            前往報價編輯
          </button>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div
            className="rounded-md bg-white p-5 flex items-center gap-6"
            style={{
              border: '1px solid #E8E4DF',
              boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">工項數</span>
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {items.length}
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">必須處理</span>
              <span
                className="text-lg font-semibold tabular-nums"
                style={{ color: blockingAlerts.length > 0 ? '#C44040' : '#5A8A58' }}
              >
                {blockingAlerts.length}
              </span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">建議</span>
              <span
                className="text-lg font-semibold tabular-nums"
                style={{ color: '#4A7FA5' }}
              >
                {infoAlerts.length}
              </span>
            </div>
            <div className="ml-auto">
              {allHandled ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0F7F0] text-[#5A8A58]">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M6 10L9 13L14 7" stroke="#5A8A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  全部已處理
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF8EE] text-[#D49028]">
                  尚有未處理項目
                </span>
              )}
            </div>
          </div>

          {/* Critical + Warning alerts (must handle) */}
          {blockingGroups.length > 0 ? (
            <div className="space-y-3">
              {blockingGroups.map((group) => (
                <div key={group.key} className="space-y-3">
                  {group.items.map((alert) => {
                    const config = SEVERITY_CONFIG[alert.severity];
                    return (
                      <div
                        key={alert.id}
                        className="rounded-md p-5"
                        style={{
                          borderLeft: `4px solid ${config.borderColor}`,
                          backgroundColor: config.bgColor,
                          boxShadow: '0 1px 3px rgba(42,42,42,0.06)',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 mt-0.5"
                            style={{
                              backgroundColor: config.badgeBg,
                              color: config.badgeText,
                            }}
                          >
                            {config.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#2A2A2A] leading-snug">
                              {alert.title}
                            </p>
                            <p className="text-xs text-[#8A8580] mt-1.5 leading-relaxed">
                              {alert.why}
                            </p>
                            <p className="text-xs italic text-[#8A8580] mt-1 leading-relaxed">
                              {alert.suggestion}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleAccept(alert)}
                              className="px-3 py-1.5 rounded text-xs font-medium text-[#8A8580] hover:text-[#2A2A2A] hover:bg-white/60 transition-colors cursor-pointer"
                            >
                              接受
                            </button>
                            {alert.canOverride && (
                              <button
                                onClick={() => handleOverride(alert)}
                                className="px-3 py-1.5 rounded text-xs font-medium border border-[#B8763E] text-[#B8763E] hover:bg-[#B8763E] hover:text-white transition-colors cursor-pointer"
                              >
                                覆寫
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-md border border-border bg-card p-12 text-center"
              style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto"
                style={{ backgroundColor: '#F0F7F0' }}
              >
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                  <path d="M6 10L9 13L14 7" stroke="#5A8A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                {alerts.length === 0
                  ? '報價內容未觸發任何風險規則，可直接進入完成確認。'
                  : '無嚴重或警告等級的風險，可直接進入完成確認。'}
              </p>
            </div>
          )}

          {/* Info alerts (suggestions, collapsible, non-blocking) */}
          {infoAlerts.length > 0 && (
            <div
              className="rounded-md bg-white overflow-hidden"
              style={{
                border: '1px solid #E8E4DF',
                boxShadow: '0 1px 3px rgba(42,42,42,0.06)',
              }}
            >
              <button
                onClick={() => setShowInfoAlerts(!showInfoAlerts)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#FDFCFA] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{ backgroundColor: '#4A7FA5', color: '#FFFFFF' }}
                  >
                    建議
                  </span>
                  <span className="text-sm text-[#8A8580]">
                    {infoAlerts.length} 項改善建議（不影響送出）
                  </span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-[#B5B0AA] transition-transform ${showInfoAlerts ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showInfoAlerts && (
                <div className="px-5 pb-4 space-y-2">
                  {infoAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded p-3"
                      style={{
                        borderLeft: '3px solid #4A7FA5',
                        backgroundColor: '#F0F6FA',
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#2A2A2A]">
                          {alert.title}
                        </p>
                        <p className="text-xs text-[#8A8580] mt-0.5">
                          {alert.suggestion}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAccept(alert)}
                        className="px-2 py-1 rounded text-[11px] text-[#8A8580] hover:text-[#2A2A2A] hover:bg-white/60 transition-colors cursor-pointer shrink-0"
                      >
                        略過
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() =>
                navigate({
                  to: '/projects/$projectId/quotation',
                  params: { projectId: 'demo' },
                })
              }
              className="px-5 py-3 rounded-md text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
            >
              返回報價編輯
            </button>
            <button
              onClick={() =>
                navigate({
                  to: '/projects/$projectId/checklist',
                  params: { projectId: 'demo' },
                })
              }
              disabled={!allHandled}
              className="flex-1 py-3 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-[#9A6232] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              style={{ boxShadow: '0 1px 3px rgba(42,42,42,0.06), 0 1px 2px rgba(42,42,42,0.04)' }}
            >
              進入完成確認
            </button>
          </div>
        </>
      )}

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
