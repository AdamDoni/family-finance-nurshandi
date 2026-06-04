import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { google } from 'googleapis'

interface BalanceRecord {
  date: string
  amount: number
  notes?: string
}

async function getBalance(): Promise<BalanceRecord[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  if (!spreadsheetId) return []

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'saldo!A2:C',
    })

    const rows = response.data.values || []
    return rows
      .filter(row => row[0] && row[1])
      .map(row => ({
        date: row[0],
        amount: parseFloat(row[1]) || 0,
        notes: row[2] || '',
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch (e) {
    console.error('Error reading balance sheet:', e)
    return []
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const balances = await getBalance()
    return NextResponse.json(balances)
  } catch (e) {
    console.error('Balance API error:', e)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
