import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getTransactions } from '@/lib/google-sheets'

const trendMonths = () => {
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    months.push(d.toISOString().slice(0, 7))
  }
  return months
}

const emptySummary = (month: string) => ({
  month,
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  byCategory: {},
  prevByCategory: {},
  trend: trendMonths().map(m => ({ month: m, income: 0, expense: 0 })),
  transactions: [],
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    return NextResponse.json(emptySummary(month))
  }

  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    const startDate = sixMonthsAgo.toISOString().slice(0, 10)

    const allTransactions = await getTransactions({ startDate })
    const monthTxs = allTransactions.filter(t => t.date.startsWith(month))

    const prevMonthDate = new Date(month + '-01')
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
    const prevMonth = prevMonthDate.toISOString().slice(0, 7)
    const prevMonthTxs = allTransactions.filter(t => t.date.startsWith(prevMonth))

    const incomes = monthTxs.filter(t => t.type === 'income')
    const expenses = monthTxs.filter(t => t.type === 'expense')

    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
    const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)

    const byCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    const prevByCategory = prevMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

    const trend = trendMonths().map(m => {
      const mTxs = allTransactions.filter(t => t.date.startsWith(m))
      return {
        month: m,
        income: mTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })

    return NextResponse.json({
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory,
      prevByCategory,
      trend,
      transactions: monthTxs,
    })
  } catch (e) {
    console.error('Sheets error:', e)
    return NextResponse.json(emptySummary(month))
  }
}
