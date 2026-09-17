import React, { useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  Bookmark,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  Plus,
  Sparkles,
} from 'lucide-react'
import Nav from './nav'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [thought, setThought] = useState('')

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
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <Nav />

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <aside className="hidden w-52 shrink-0 lg:block">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"><LayoutDashboard size={18} /> Overview</a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"><Home size={18} /> My feed</a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"><Bookmark size={18} /> Saved thoughts</a>
            <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"><FileText size={18} /> Drafts</a>
          </nav>
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-100">
            <Sparkles size={20} className="mb-5 text-indigo-200" />
            <p className="text-sm font-semibold">Make space for your ideas.</p>
            <p className="mt-1 text-xs leading-5 text-indigo-100">A small thought today can become something meaningful.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 px-6 py-7 text-white shadow-xl shadow-indigo-100 sm:px-8">
            <div className="relative z-[1] max-w-xl">
              <p className="mb-2 text-sm font-medium text-indigo-200">Good to see you, {userName.split(' ')[0]}.</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What is on your mind today?</h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">Capture the moments, questions, and ideas worth coming back to.</p>
            </div>
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border-[24px] border-violet-400/10" />
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {user?.USER_PROFILE_PIC ? (
                  <img src={user.USER_PROFILE_PIC} alt={userInitial} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Write a thought</h2>
                <p className="text-xs text-slate-400">Share something with your future self</p>
              </div>
            </div>
            <textarea
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              placeholder="Start writing something meaningful..."
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">{thought.length}/500 characters</span>
              <button type="button" disabled={!thought.trim()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"><Plus size={17} /> Publish thought</button>
            </div>
          </section>

          <section className="mt-6 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">Your space</p><h2 className="mt-1 text-xl font-bold text-slate-900">Recent thoughts</h2></div>
            <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View all</button>
          </section>
          <section className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500"><BookOpen size={25} /></div>
            <h3 className="mt-4 font-semibold text-slate-800">Your story starts here</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Publish your first thought and it will appear here for you to revisit anytime.</p>
          </section>
        </main>

        <aside className="hidden w-64 shrink-0 xl:block">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Your rhythm</h2>
            <p className="mt-1 text-xs text-slate-400">A quiet look at your week</p>
            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div><p className="text-xl font-bold text-slate-800">0</p><p className="mt-1 text-[11px] text-slate-400">Thoughts</p></div>
              <div><p className="text-xl font-bold text-slate-800">0</p><p className="mt-1 text-[11px] text-slate-400">Likes</p></div>
              <div><p className="text-xl font-bold text-slate-800">0</p><p className="mt-1 text-[11px] text-slate-400">Replies</p></div>
            </div>
          </section>
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-bold text-slate-800">Quick view</h2><MessageCircle size={17} className="text-indigo-500" /></div>
            <div className="mt-5 space-y-4 text-sm text-slate-500"><p className="flex items-center gap-3"><Heart size={17} className="text-rose-400" /> Keep your ideas close.</p><p className="flex items-center gap-3"><Bookmark size={17} className="text-amber-400" /> Save what inspires you.</p></div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard
