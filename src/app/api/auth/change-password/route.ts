import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getUserFromSheet, updateUserPassword } from '@/lib/google-sheets'
import bcrypt from 'bcryptjs'

const DEFAULT_HASH = '$2a$10$rUxzBjBUoehXMg0nMnP8guLi.PECDYHPM9B9ZuvJ8bGGqJLwNnq6i'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  const email = session.user.email
  const sheetUser = await getUserFromSheet(email)
  const currentHash = sheetUser?.passwordHash ?? DEFAULT_HASH

  const valid = await bcrypt.compare(currentPassword, currentHash)
  if (!valid) return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 400 })

  const newHash = await bcrypt.hash(newPassword, 10)
  await updateUserPassword(email, newHash)

  return NextResponse.json({ ok: true })
}
