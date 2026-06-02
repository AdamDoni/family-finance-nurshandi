import { google } from 'googleapis'
import { Transaction } from '@/types'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!
const SHEET_NAME = 'transactions'

function rowToTransaction(row: string[]): Transaction | null {
  if (!row[0]) return null
  return {
    id: row[0],
    date: row[1],
    type: row[2] as Transaction['type'],
    category: row[3] as Transaction['category'],
    description: row[4],
    amount: parseFloat(row[5]) || 0,
    who: row[6] as Transaction['who'],
    notes: row[7] || '',
    createdAt: row[8] || '',
  }
}

export async function getTransactions(filters?: {
  month?: string
  type?: string
  startDate?: string
}): Promise<Transaction[]> {
  const sheets = getSheets()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:I`,
  })

  const rows = response.data.values || []
  let transactions = rows
    .map(row => rowToTransaction(row as string[]))
    .filter((t): t is Transaction => t !== null)

  if (filters?.month) {
    transactions = transactions.filter(t => t.date.startsWith(filters.month!))
  }
  if (filters?.type) {
    transactions = transactions.filter(t => t.type === filters.type)
  }
  if (filters?.startDate) {
    transactions = transactions.filter(t => t.date >= filters.startDate!)
  }

  return transactions.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
}

export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const sheets = getSheets()
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2)
  const createdAt = new Date().toISOString()

  const row = [
    id,
    transaction.date,
    transaction.type,
    transaction.category,
    transaction.description,
    transaction.amount.toString(),
    transaction.who,
    transaction.notes || '',
    createdAt,
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:I`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })

  return { ...transaction, id, createdAt }
}

export async function deleteTransaction(id: string): Promise<void> {
  const sheets = getSheets()

  const colResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:A`,
  })

  const rows = colResponse.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === id)
  if (rowIndex === -1) throw new Error('Transaction not found')

  const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const sheet = sheetInfo.data.sheets?.find(s => s.properties?.title === SHEET_NAME)
  if (!sheet?.properties?.sheetId === undefined) throw new Error('Sheet not found')

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet!.properties!.sheetId!,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  })
}

export async function ensureSheetHeaders(): Promise<void> {
  const sheets = getSheets()
  const headers = ['id', 'date', 'type', 'category', 'description', 'amount', 'who', 'notes', 'createdAt']

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:I1`,
  })

  if (!res.data.values?.[0]?.[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    })
  }
}

// ── User / password management ─────────────────────────────────────────────

export async function getUserFromSheet(email: string): Promise<{
  email: string
  passwordHash: string
  mustChangePassword: boolean
} | null> {
  try {
    const sheets = getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'users!A2:C',
    })
    const rows = (res.data.values || []) as string[][]
    const row = rows.find(r => r[0] === email)
    if (!row) return null
    return {
      email: row[0],
      passwordHash: row[1],
      mustChangePassword: row[2] === 'true',
    }
  } catch {
    return null
  }
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<void> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'users!A2:C',
  })
  const rows = (res.data.values || []) as string[][]
  const rowIndex = rows.findIndex(r => r[0] === email)

  if (rowIndex === -1) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'users!A:C',
      valueInputOption: 'RAW',
      requestBody: { values: [[email, passwordHash, 'false']] },
    })
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `users!A${rowIndex + 2}:C${rowIndex + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[email, passwordHash, 'false']] },
    })
  }
}
