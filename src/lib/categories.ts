export const INCOME_CATEGORIES = ['Gaji', 'Hadiah', 'Investasi', 'Pekerjaan Lepas', 'Dividen', 'Bonus', 'Lainnya'] as const;

export const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Belanjaan',
  'Transportasi',
  'Tempat Tinggal',
  'Tagihan & Utilitas',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Perjalanan',
  'Langganan',
  'Perawatan Pribadi',
  'Keluarga',
  'Hewan Peliharaan',
  'Lainnya',
] as const;

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;
