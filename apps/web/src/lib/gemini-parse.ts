import type { TradeCategory } from '@q-check/construction-knowledge';

export interface ParsedItem {
  category: TradeCategory;
  itemName: string;
  unit: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  specification: string | null;
}

export interface ParsedQuotation {
  items: ParsedItem[];
}

const GEMINI_PROXY_URL = 'https://q-check-gemini-proxy.q-check-javis.workers.dev/api/parse-pdf';

const PARSE_PROMPT = `請解析這份室內裝修報價單，萃取所有工項。

分類指引（請嚴格遵守）：
- protection（保護工程）：電梯保護、公設保護、地板保護、門框保護
- demolition（拆除工程）：天花板拆除、隔間拆除、地磚拆除、壁磚拆除、廚具拆除、浴室拆除
- plumbing（水電工程）：電線、迴路、開關、插座、燈具、燈具安裝、弱電、網路線、給水管、排水管、配電箱、對講機、門鈴、衛浴設備安裝（馬桶/面盆/淋浴）
- masonry（泥作工程）：砌磚、粉光、打底、貼磁磚、地面整平、洗石子
- waterproofing（防水工程）：防水層、防水工程、試水測試
- carpentry（木作工程）：天花板、木作隔間、木作櫃體、窗簾盒、踢腳板、木作門框、造型牆
- painting（油漆工程）：批土、底漆、面漆、油漆、乳膠漆、護木漆
- flooring（地板工程）：木地板、SPC地板、PVC地板、地毯、自平水泥
- ceiling（天花板工程）：輕鋼架天花、矽酸鈣板天花、造型天花
- cabinet（系統櫃/廚具）：系統櫃、衣櫃、書櫃、鞋櫃、廚具、檯面、中島
- hvac（空調設備）：冷氣、全熱交換器、冷氣排水管、冷媒管
- window_door（門窗工程）：鋁窗、氣密窗、玻璃、門片、門鎖、紗窗、窗簾、百葉窗
- cleaning（清潔工程）：粗清、細清、除甲醛
- transport（搬運工程）：搬運費、吊車、廢棄物清運、垃圾清運
- other（其他）：僅用於以上分類都無法歸類的項目，如設計費、管理費、稅金、家具採購、軟裝

回傳 JSON 格式（不要加 markdown code block）：
{"items": [{"category": "分類代碼", "itemName": "工項名稱", "unit": "單位", "quantity": 數量或null, "unitPrice": 單價或null, "totalPrice": 小計或null, "specification": "規格說明或null"}]}`;

const VALID_CATEGORIES: Set<string> = new Set([
  'protection', 'demolition', 'plumbing', 'masonry', 'waterproofing',
  'carpentry', 'painting', 'flooring', 'ceiling', 'cabinet',
  'hvac', 'window_door', 'cleaning', 'transport', 'other',
]);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (data:application/pdf;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function parseQuotationPDF(file: File): Promise<ParsedQuotation> {
  const base64Data = await fileToBase64(file);

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          {
            text: PARSE_PROMPT,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(GEMINI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 錯誤 (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini API 未回傳有效結果');
  }

  const textContent = candidate.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini API 回傳格式異常');
  }

  // Parse the JSON response
  let parsed: { items: ParsedItem[] };
  try {
    parsed = JSON.parse(textContent);
  } catch {
    throw new Error('Gemini 回傳的 JSON 格式無法解析');
  }

  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error('Gemini 回傳的資料格式不正確，缺少 items 陣列');
  }

  // Validate and normalize categories
  const validatedItems: ParsedItem[] = parsed.items.map((item) => ({
    category: VALID_CATEGORIES.has(item.category)
      ? (item.category as TradeCategory)
      : 'other',
    itemName: item.itemName || '未命名工項',
    unit: item.unit || '式',
    quantity: typeof item.quantity === 'number' ? item.quantity : null,
    unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : null,
    totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : null,
    specification: item.specification || null,
  }));

  return { items: validatedItems };
}
