import type { RiskAlert } from '@q-check/construction-knowledge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RiskAlertPanelProps {
  alerts: RiskAlert[];
  dismissedIds: Set<string>;
  onAccept: (alert: RiskAlert) => void;
  onOverride: (alert: RiskAlert) => void;
}

const SEVERITY_CONFIG = {
  critical: {
    label: '嚴重',
    borderColor: '#C44040',
    bgColor: '#FEF2F2',
    badgeBg: '#C44040',
    badgeText: '#FFFFFF',
  },
  warning: {
    label: '警告',
    borderColor: '#D49028',
    bgColor: '#FFF8EE',
    badgeBg: '#D49028',
    badgeText: '#FFFFFF',
  },
  info: {
    label: '建議',
    borderColor: '#4A7FA5',
    bgColor: '#F0F6FA',
    badgeBg: '#4A7FA5',
    badgeText: '#FFFFFF',
  },
} as const;

export function RiskAlertPanel({
  alerts,
  dismissedIds,
  onAccept,
  onOverride,
}: RiskAlertPanelProps) {
  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));

  const criticalAlerts = visibleAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = visibleAlerts.filter((a) => a.severity === 'warning');
  const infoAlerts = visibleAlerts.filter((a) => a.severity === 'info');

  const grouped = [
    { key: 'critical' as const, items: criticalAlerts },
    { key: 'warning' as const, items: warningAlerts },
    { key: 'info' as const, items: infoAlerts },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #E8E4DF' }}
      >
        <h3 className="text-sm font-semibold text-[#2A2A2A] tracking-tight">
          風險檢查
        </h3>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{
            backgroundColor: visibleAlerts.length > 0 ? '#FEF2F2' : '#F0F7F0',
            color: visibleAlerts.length > 0 ? '#C44040' : '#5A8A58',
          }}
        >
          {visibleAlerts.length} 項
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {visibleAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              {/* Decorative check */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#F0F7F0' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 10L9 13L14 7"
                    stroke="#5A8A58"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-[#B5B0AA] text-center">
                目前沒有風險提醒
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.key} className="space-y-2.5">
              {group.items.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className="rounded-md p-4"
                    style={{
                      borderLeft: `3px solid ${config.borderColor}`,
                      backgroundColor: config.bgColor,
                    }}
                  >
                    <div className="flex items-start gap-2 mb-1.5">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 mt-0.5"
                        style={{
                          backgroundColor: config.badgeBg,
                          color: config.badgeText,
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#2A2A2A] leading-snug">
                      {alert.title}
                    </p>
                    <p className="text-xs text-[#8A8580] mt-1.5 leading-relaxed">
                      {alert.why}
                    </p>
                    <p className="text-xs italic text-[#8A8580] mt-1 leading-relaxed">
                      {alert.suggestion}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onAccept(alert)}
                        className="px-3 py-1.5 rounded text-xs font-medium text-[#8A8580] hover:text-[#2A2A2A] hover:bg-white/60 transition-colors cursor-pointer"
                      >
                        接受
                      </button>
                      {alert.canOverride && (
                        <button
                          onClick={() => onOverride(alert)}
                          className="px-3 py-1.5 rounded text-xs font-medium border border-[#B8763E] text-[#B8763E] hover:bg-[#B8763E] hover:text-white transition-colors cursor-pointer"
                        >
                          覆寫
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
