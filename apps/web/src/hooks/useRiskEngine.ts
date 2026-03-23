import { useState, useEffect, useRef } from 'react';
import { runRiskEngine } from '@q-check/construction-knowledge';
import type { QuotationItem, SiteCondition, Override, RiskAlert } from '@q-check/construction-knowledge';

export function useRiskEngine(
  items: QuotationItem[],
  siteCondition: SiteCondition,
  overrides: Override[]
): RiskAlert[] {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Skip if site condition is incomplete
    if (siteCondition.totalArea <= 0) {
      setAlerts([]);
      return;
    }

    timerRef.current = setTimeout(() => {
      const result = runRiskEngine({ items, siteCondition, overrides });
      setAlerts(result);
    }, 300);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [items, siteCondition, overrides]);

  return alerts;
}
