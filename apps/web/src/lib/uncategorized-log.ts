import type { ParsedItem } from './gemini-parse';

/**
 * 記錄被歸類為 "other" 的工項到 localStorage，供未來改善分類使用。
 * 正式環境應改為送到後端 API。
 */
export function logUncategorizedItems(items: ParsedItem[]): void {
  const otherItems = items.filter((i) => i.category === 'other');
  if (otherItems.length === 0) return;

  const existing: unknown[] = JSON.parse(
    localStorage.getItem('q-check-uncategorized') || '[]'
  );
  const newEntries = otherItems.map((i) => ({
    itemName: i.itemName,
    unit: i.unit,
    timestamp: new Date().toISOString(),
  }));
  localStorage.setItem(
    'q-check-uncategorized',
    JSON.stringify([...existing, ...newEntries])
  );

  console.log(
    `[Q-Check] ${otherItems.length} 個未分類工項已記錄，供未來學習使用`
  );
}
