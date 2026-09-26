import React, { useEffect, useState } from 'react'
import {
  Bell,
  NotebookPen,
  Search,
} from 'lucide-react'

const Nav = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('http://localhost:8000/me', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }

    getUser()
  }, [])

  const userName = user?.USER_NAME || 'Thoughtful writer'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-5 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-8">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <NotebookPen size={21} strokeWidth={2.2} />
        </div>
        <span className="hidden bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-black tracking-tight text-transparent sm:block">
          THOUGHTBOOK
        </span>
      </div>

      <div className="relative hidden w-full max-w-md md:block">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search thoughts..."
          aria-label="Search thoughts"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button type="button" aria-label="Notifications" title="Notifications" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-400 p-[2px] shadow-md">
            {user?.USER_PROFILE_PIC ? (
              <img src={user.USER_PROFILE_PIC} alt={`${userName} profile`} className="h-9 w-9 rounded-full border-2 border-white object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-sm font-bold text-indigo-700">{userInitial}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Nav