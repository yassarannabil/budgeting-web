
import type { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';

export type TransactionType = 'income' | 'expense';

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface BudgetSuggestion {
  category: string;
  amount: number;
}

export type DateRangeFilter = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'custom';

export interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}
