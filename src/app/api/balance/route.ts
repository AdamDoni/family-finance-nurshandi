import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getTransactions } from '@/lib/google-sheets'

interface MonthlyBalance {
  month: string
  monthlyBalance: number
  cumulativeBalance: number
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    if (!process.env.GOOGLE_SPREADSHEET_ID) return NextResponse.json([])

    const allTransactions = await getTransactions()

    // Group by month
    const monthlyData: Record<string, { income: number; expense: number }> = {}
    allTransactions.forEach(t => {
      const month = t.date.slice(0, 7)
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 }
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount
      } else {
        monthlyData[month].expense += t.amount
      }
    })

    // Calculate cumulative balance
    const months = Object.keys(monthlyData).sort()
    let cumulativeBalance = 0
    const balances: MonthlyBalance[] = months.map(month => {
      const monthlyBalance = monthlyData[month].income - monthlyData[month].expense
      cumulativeBalance += monthlyBalance
      return {
        month,
        monthlyBalance,
        cumulativeBalance,
      }
    })

    return NextResponse.json(balances.reverse())
  } catch (e) {
    console.error('Balance API error:', e)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
