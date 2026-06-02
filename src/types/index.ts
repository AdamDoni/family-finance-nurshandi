export type TransactionType = 'income' | 'expense'

export type ExpenseCategory =
  | 'angsuran-bulanan'
  | 'transportasi'
  | 'makan'
  | 'rumah-tangga'
  | 'kebutuhan-anak'
  | 'lain-lain'

export type IncomeCategory =
  | 'gaji'
  | 'bisnis'
  | 'investasi'
  | 'lain-lain-pemasukan'

export type Category = ExpenseCategory | IncomeCategory

export interface Transaction {
  id: string
  date: string
  type: TransactionType
  category: Category
  description: string
  amount: number
  who: 'Adam' | 'Rifda'
  notes?: string
  createdAt: string
}

export interface SummaryData {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: Record<string, number>
  prevByCategory: Record<string, number>
  trend: Array<{ month: string; income: number; expense: number }>
  transactions: Transaction[]
}
