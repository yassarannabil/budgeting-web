export const INCOME_CATEGORIES = ['Salary', 'Gifts', 'Investment', 'Freelance', 'Dividends', 'Bonus', 'Other'] as const;

export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Groceries',
  'Transport',
  'Housing',
  'Bills & Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Subscriptions',
  'Personal Care',
  'Family',
  'Pets',
  'Other',
] as const;

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;
