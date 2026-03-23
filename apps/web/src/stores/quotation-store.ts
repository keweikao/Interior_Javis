import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  QuotationItem,
  SiteCondition,
  Override,
  ProjectType,
} from '@q-check/construction-knowledge';

const DEFAULT_SITE_CONDITION: SiteCondition = {
  totalArea: 0,
  floorLevel: 1,
  hasElevator: true,
  buildingType: 'mid_age',
  buildingAge: 0,
  clientBudget: null,
};

interface QuotationStore {
  // Project name
  projectName: string;
  setProjectName: (name: string) => void;

  // Project type
  projectType: ProjectType;
  setProjectType: (type: ProjectType) => void;

  // Site condition
  siteCondition: SiteCondition;
  setSiteCondition: (condition: Partial<SiteCondition>) => void;

  // Quotation items
  items: QuotationItem[];
  addItem: (item: QuotationItem) => void;
  addItems: (items: QuotationItem[]) => void;
  updateItem: (id: string, updates: Partial<QuotationItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;

  // Overrides
  overrides: Override[];
  addOverride: (override: Override) => void;

  // Computed
  totalAmount: number;

  // Reset
  resetAll: () => void;
}

const STORAGE_KEY = 'q-check-quotation';

export const useQuotationStore = create<QuotationStore>()(
  persist(
    (set) => ({
      projectName: '',
      setProjectName: (name) => set({ projectName: name }),

      projectType: 'mid_age',
      setProjectType: (type) =>
        set((state) => ({
          projectType: type,
          siteCondition: { ...state.siteCondition, buildingType: type },
        })),

      siteCondition: { ...DEFAULT_SITE_CONDITION },
      setSiteCondition: (condition) =>
        set((state) => ({
          siteCondition: { ...state.siteCondition, ...condition },
        })),

      items: [],
      addItem: (item) =>
        set((state) => {
          const newItems = [...state.items, item];
          return { items: newItems, totalAmount: computeTotal(newItems) };
        }),
      addItems: (newItems) =>
        set((state) => {
          const items = [...state.items, ...newItems];
          return { items, totalAmount: computeTotal(items) };
        }),
      updateItem: (id, updates) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  totalPrice:
                    (updates.quantity ?? item.quantity ?? 0) *
                    (updates.unitPrice ?? item.unitPrice ?? 0),
                }
              : item
          );
          return { items, totalAmount: computeTotal(items) };
        }),
      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          return { items, totalAmount: computeTotal(items) };
        }),
      clearItems: () => set({ items: [], totalAmount: 0 }),

      overrides: [],
      addOverride: (override) =>
        set((state) => ({
          overrides: [...state.overrides, override],
        })),

      totalAmount: 0,

      resetAll: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
          projectName: '',
          projectType: 'mid_age',
          siteCondition: { ...DEFAULT_SITE_CONDITION },
          items: [],
          overrides: [],
          totalAmount: 0,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        projectName: state.projectName,
        projectType: state.projectType,
        siteCondition: state.siteCondition,
        items: state.items,
        overrides: state.overrides,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.items.length > 0) {
          state.totalAmount = computeTotal(state.items);
        }
      },
    }
  )
);

function computeTotal(items: QuotationItem[]): number {
  return items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
}
