import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getTransactions, addTransaction } from '@/lib/google-sheets'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.GOOGLE_SPREADSHEET_ID) return NextResponse.json([])

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') || undefined
  const type = searchParams.get('type') || undefined

  try {
    const transactions = await getTransactions({ month, type })
    return NextResponse.json(transactions)
  } catch (e) {
    console.error('Sheets error:', e)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    return NextResponse.json({ error: 'Google Sheets belum dikonfigurasi' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const transaction = await addTransaction(body)
    return NextResponse.json(transaction)
  } catch (e) {
    console.error('Sheets error:', e)
    return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 })
  }
}
