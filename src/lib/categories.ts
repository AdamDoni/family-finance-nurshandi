export const EXPENSE_CATEGORIES = [
  { id: 'angsuran-bulanan', label: 'Angsuran Bulanan', emoji: '🏦', color: '#6366f1' },
  { id: 'transportasi', label: 'Transportasi', emoji: '🚗', color: '#f59e0b' },
  { id: 'makan', label: 'Makan', emoji: '🍽️', color: '#ef4444' },
  { id: 'rumah-tangga', label: 'Rumah Tangga', emoji: '🏠', color: '#8b5cf6' },
  { id: 'kebutuhan-anak', label: 'Kebutuhan Anak', emoji: '👶', color: '#ec4899' },
  { id: 'lain-lain', label: 'Lain-lain', emoji: '📦', color: '#6b7280' },
] as const

export const INCOME_CATEGORIES = [
  { id: 'gaji', label: 'Gaji', emoji: '💼', color: '#22c55e' },
  { id: 'bisnis', label: 'Bisnis/Usaha', emoji: '💰', color: '#10b981' },
  { id: 'investasi', label: 'Investasi', emoji: '📈', color: '#14b8a6' },
  { id: 'lain-lain-pemasukan', label: 'Lain-lain', emoji: '📦', color: '#6b7280' },
] as const

export function getCategoryInfo(categoryId: string) {
  return (
    EXPENSE_CATEGORIES.find(c => c.id === categoryId) ||
    INCOME_CATEGORIES.find(c => c.id === categoryId) ||
    { id: categoryId, label: categoryId, emoji: '📦', color: '#6b7280' }
  )
}
