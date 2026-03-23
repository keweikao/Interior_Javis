import type { RiskAlert } from '@q-check/construction-knowledge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    border: 'border-l-4 border-l-red-500',
    badgeClass: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  warning: {
    label: '警告',
    border: 'border-l-4 border-l-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  info: {
    label: '建議',
    border: 'border-l-4 border-l-blue-500',
    badgeClass: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
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
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">風險檢查</h3>
        <Badge variant="secondary" className="text-xs">
          {visibleAlerts.length} 項
        </Badge>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-3 space-y-3">
          {visibleAlerts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              目前沒有風險提醒
            </p>
          )}

          {grouped.map((group) => (
            <div key={group.key} className="space-y-2">
              {group.items.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity];
                return (
                  <div
                    key={alert.id}
                    className={`rounded-md border bg-card p-3 ${config.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${config.badgeClass}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm leading-snug">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.why}
                        </p>
                        <p className="text-xs italic text-muted-foreground mt-1">
                          {alert.suggestion}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onAccept(alert)}
                      >
                        接受
                      </Button>
                      {alert.canOverride && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onOverride(alert)}
                        >
                          覆寫
                        </Button>
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
