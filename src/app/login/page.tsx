'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/Spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) setError('Email atau password salah')
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: 'var(--hero-glow1)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl" style={{ background: 'var(--hero-glow2)' }} />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="glass rounded-3xl p-8">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--acc-bg)', border: '1px solid var(--border)' }}
            >
              <span className="text-2xl">💎</span>
            </div>
            <h1 className="font-serif text-2xl font-bold t1 tracking-wide">Family Finance</h1>
            <p className="t3 text-sm mt-2">Adit & Lulu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="inp w-full rounded-xl px-4 py-3 text-sm"
                placeholder="email@gmail.com" required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold t3 mb-2 uppercase tracking-widest">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="inp w-full rounded-xl px-4 py-3 text-sm"
                placeholder="••••••••" required
              />
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 bg-neg" style={{ background: 'var(--neg-bg)', border: '1px solid var(--border)' }}>
                <p className="text-neg text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 transition duration-200 mt-2 text-sm tracking-wide flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--acc)', opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--acc-hover)' }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--acc)')}
            >
              {loading && <Spinner size={15} />}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
        <p className="text-center t3 text-xs mt-6">Family Finance · Pribadi & Rahasia</p>
      </div>
    </div>
  )
}
