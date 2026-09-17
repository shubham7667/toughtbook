// HELLO THIS IS A CHNAGE
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
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [thought, setThought] = useState('')
  const [mood, setMood] = useState('💡 Inspired')
  const [tagInput, setTagInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [thoughts, setThoughts] = useState(() => {
    try {
      const savedThoughts = localStorage.getItem('thoughtbook-thoughts')
      return savedThoughts ? JSON.parse(savedThoughts) : []
    } catch {
      return []
    }
  })

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
      } catch {
        // The dashboard can still work before the backend is running.
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    localStorage.setItem('thoughtbook-thoughts', JSON.stringify(thoughts))
  }, [thoughts])

  const userName = user?.USER_NAME || 'Thoughtful writer'
  const userInitial = userName.charAt(0).toUpperCase()

  const publishThought = () => {
    if (!thought.trim()) return

    const tags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))

    const newThought = {
      id: Date.now(),
      text: thought.trim(),
      mood,
      tags,
      createdAt: new Date().toLocaleString(),
      saved: false,
      likes: 0,
    }

    setThoughts((currentThoughts) => [newThought, ...currentThoughts])
    setThought('')
    setTagInput('')
    setMood('💡 Inspired')
  }

  const toggleSaved = (id) => {
    setThoughts((currentThoughts) =>
      currentThoughts.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    )
  }

  const toggleLike = (id) => {
    setThoughts((currentThoughts) =>
      currentThoughts.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    )
  }

  const displayedThoughts = thoughts.filter((item) => {
    const searchableText = `${item.text} ${item.tags.join(' ')} ${item.mood}`
    return searchableText.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const savedCount = thoughts.filter((item) => item.saved).length
  const totalLikes = thoughts.reduce((total, item) => total + item.likes, 0)

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <nav className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-5 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <NotebookPen size={21} strokeWidth={2.2} />
          </div>

          <span className="hidden bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-black tracking-tight text-transparent sm:block">
            THOUGHTBOOK
          </span>
        </div>

        <div className="relative hidden w-full max-w-md md:block">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search thoughts or tags..."
            aria-label="Search thoughts"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <Bell size={20} />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500"
              aria-hidden="true"
            />
          </button>

          <div className="rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-400 p-[2px] shadow-md">
            {user?.USER_PROFILE_PIC ? (
              <img
                src={user.USER_PROFILE_PIC}
                alt={`${userName} profile`}
                className="h-9 w-9 rounded-full border-2 border-white object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-sm font-bold text-indigo-700">
                {userInitial}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <aside className="hidden w-52 shrink-0 lg:block">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"
            >
              <LayoutDashboard size={18} />
              Overview
            </a>

            <a
              href="#"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"
            >
              <Home size={18} />
              My feed
            </a>

            <a
              href="#"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"
            >
              <Bookmark size={18} />
              Saved thoughts
            </a>

            <a
              href="#"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-indigo-600"
            >
              <FileText size={18} />
              Drafts
            </a>
          </nav>

          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-100">
            <Sparkles size={20} className="mb-5 text-indigo-200" />
            <p className="text-sm font-semibold">Make space for your ideas.</p>
            <p className="mt-1 text-xs leading-5 text-indigo-100">
              A small thought today can become something meaningful.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 px-6 py-7 text-white shadow-xl shadow-indigo-100 sm:px-8">
            <div className="relative z-[1] max-w-xl">
              <p className="mb-2 text-sm font-medium text-indigo-200">
                Good to see you, {userName.split(' ')[0]}.
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What is on your mind today?
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                Capture the moments, questions, and ideas worth coming back to.
              </p>
            </div>

            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border-[24px] border-violet-400/10" />
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              {user?.USER_PROFILE_PIC ? (
                <img
                  src={user.USER_PROFILE_PIC}
                  alt={`${userName} profile`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {userInitial}
                </div>
              )}

              <div>
                <h2 className="text-sm font-bold text-slate-800">Write a thought</h2>
                <p className="text-xs text-slate-400">
                  Share something with your future self
                </p>
              </div>
            </div>

            <textarea
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              maxLength={500}
              placeholder="Start writing something meaningful..."
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-400"
                >
                  <option>💡 Inspired</option>
                  <option>😊 Happy</option>
                  <option>😔 Reflective</option>
                  <option>😤 Frustrated</option>
                  <option>😌 Calm</option>
                </select>

                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Tags: idea, journal"
                  className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">
                  {thought.length}/500 characters
                </span>

                <button
                  type="button"
                  onClick={publishThought}
                  disabled={!thought.trim()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  <Plus size={17} />
                  Publish thought
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
                Your space
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Recent thoughts
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </button>
          </section>

          <section className="mt-4 space-y-4">
            {displayedThoughts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <BookOpen size={25} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  {thoughts.length === 0
                    ? 'Your story starts here'
                    : 'No thoughts found'}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {thoughts.length === 0
                    ? 'Publish your first thought and it will appear here for you to revisit anytime.'
                    : 'Try a different search word or clear your search.'}
                </p>
              </div>
            ) : (
              displayedThoughts.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.mood}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.createdAt}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaved(item.id)}
                      className={`rounded-lg p-2 transition ${
                        item.saved
                          ? 'bg-amber-50 text-amber-500'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      aria-label="Save thought"
                    >
                      <Bookmark
                        size={18}
                        fill={item.saved ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {item.text}
                  </p>

                  {item.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleLike(item.id)}
                      className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-rose-500"
                    >
                      <Heart size={18} />
                      {item.likes} {item.likes === 1 ? 'like' : 'likes'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>

        <aside className="hidden w-64 shrink-0 xl:block">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Your rhythm</h2>
            <p className="mt-1 text-xs text-slate-400">
              A quiet look at your week
            </p>

            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div>
                <p className="text-xl font-bold text-slate-800">{thoughts.length}</p>
                <p className="mt-1 text-[11px] text-slate-400">Thoughts</p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-800">{totalLikes}</p>
                <p className="mt-1 text-[11px] text-slate-400">Likes</p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-800">{savedCount}</p>
                <p className="mt-1 text-[11px] text-slate-400">Saved</p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Quick view</h2>
              <MessageCircle size={17} className="text-indigo-500" />
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-500">
              <p className="flex items-center gap-3">
                <Heart size={17} className="text-rose-400" />
                Keep your ideas close.
              </p>

              <p className="flex items-center gap-3">
                <Bookmark size={17} className="text-amber-400" />
                Save what inspires you.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Dashboard