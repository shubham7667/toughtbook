import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function AdminLogin() {
  const navigate = useNavigate()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!loginId.trim() || !password) {
      setError('Enter your login ID and password.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          login_id: loginId.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid login ID or password.')
      }

      navigate('/admin')
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-800">
      <div className="mx-auto grid min-h-[680px] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-10 text-white lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck size={23} />
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">THOUGHTBOOK</p>
              <p className="text-xs font-semibold tracking-widest text-indigo-200">
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <div className="mt-28">
            <p className="text-sm font-semibold text-indigo-200">
              Community management
            </p>

            <h1 className="mt-3 text-5xl font-bold leading-tight">
              Manage your community with clarity.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-indigo-100">
              Every administrator has a separate login ID and password, but
              they use the same protected admin portal.
            </p>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 lg:hidden">
              <ShieldCheck size={24} />
            </div>

            <p className="mt-6 text-sm font-semibold text-indigo-600">
              ADMINISTRATOR ACCESS
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Sign in using your personal administrator credentials.
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Login ID
                </span>

                <div className="relative">
                  <UserRound
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    placeholder="Example: admin1"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </span>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-300"
              >
                {isLoading ? 'Signing in...' : 'Sign in to admin portal'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}