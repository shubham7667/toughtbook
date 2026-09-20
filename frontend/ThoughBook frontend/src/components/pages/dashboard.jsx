import React, { useEffect, useState } from 'react'
import {
  Bell,
  BookOpen,
  CalendarDays,
  Flame,
  Heart,
  Home,
  LayoutDashboard,
  MessageCircle,
  NotebookPen,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [thought, setThought] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [postError, setPostError] = useState('')

  const [activeView, setActiveView] = useState('overview')
  const [notice, setNotice] = useState('')

  // Get logged-in user
  useEffect(() => {
    fetch('http://localhost:8000/me', {
      credentials: 'include',
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user:', error)
      })
  }, [])

  // Get thoughts from database
  const fetchPosts = async () => {
    setIsLoadingPosts(true)
    setPostError('')

    try {
      const response = await fetch('http://localhost:8000/get/post', {
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load posts.')
      }

      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPostError('We could not load your thoughts right now.')
    } finally {
      setIsLoadingPosts(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Publish thought to database
  const publishThought = async () => {
    const trimmedThought = thought.trim()

    if (!trimmedThought) {
      return
    }

    try {
      const response = await fetch('http://localhost:8000/thought/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          thought: trimmedThought,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to publish thought.')
      }

      setThought('')
      setNotice('Thought published successfully.')

      await fetchPosts()

      setTimeout(() => {
        setNotice('')
      }, 2500)
    } catch (error) {
      console.error('Failed to publish thought:', error)
      setPostError('We could not publish your thought right now.')
    }
  }

  const userName = user?.USER_NAME || 'Thoughtful writer'
  const userInitial = userName.charAt(0).toUpperCase()

  const displayedPosts = posts.filter((item) =>
    (item.thought || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const totalLikes = posts.reduce(
    (total, item) =>
      total + (item.likes_count ?? item.like_count ?? 0),
    0
  )

  const totalComments = posts.reduce(
    (total, item) =>
      total + (item.comments_count ?? item.comment_count ?? 0),
    0
  )

  const navItems = [
    ['overview', LayoutDashboard, 'Overview'],
    ['feed', Home, 'My feed'],
  ]

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
      {notice && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {notice}
        </div>
      )}

      {/* Top navigation */}
      <nav className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-5 border-b border-slate-200/80 bg-white/95 px-5 py-3 backdrop-blur sm:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <NotebookPen size={21} />
          </div>

          <span className="hidden bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-black tracking-tight text-transparent sm:block">
            THOUGHTBOOK
          </span>
        </div>

        <label className="relative hidden w-full max-w-md md:block">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search thoughts..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </label>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
          </button>

          <Avatar
            user={user}
            name={userName}
            initial={userInitial}
          />
        </div>
      </nav>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:px-10">

        {/* Left sidebar */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeView === id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-white hover:text-indigo-600'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-100">
            <Sparkles size={20} className="mb-5 text-indigo-200" />

            <p className="text-sm font-semibold">
              Make space for your ideas.
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-100">
              A small thought today can become something meaningful.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">

          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 px-6 py-7 text-white shadow-xl shadow-indigo-100 sm:px-8">
            <div className="relative z-10 max-w-xl">
              <p className="mb-2 text-sm font-medium text-indigo-200">
                Good to see you, {userName.split(' ')[0]}.
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A home for your clearest thinking.
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                Capture moments, questions, and ideas worth coming back to.
              </p>

              <div className="mt-5 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                  <Flame size={15} className="text-amber-300" />
                  {posts.length > 0 ? 'Writing today' : 'Start your journey'}
                </span>

                <span className="text-indigo-200">
                  {posts.length} memories saved
                </span>
              </div>
            </div>

            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border-[24px] border-violet-400/10" />
          </section>

          {/* Write thought */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar
                user={user}
                name={userName}
                initial={userInitial}
                small
              />

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Write a thought
                </h2>

                <p className="text-xs text-slate-400">
                  Your thought will be stored in the database
                </p>
              </div>
            </div>

            <textarea
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              maxLength={500}
              placeholder="Start writing something meaningful..."
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {thought.length}/500
              </span>

              <button
                type="button"
                disabled={!thought.trim()}
                onClick={publishThought}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                <Plus size={17} />
                Publish
              </button>
            </div>
          </section>

          {/* Thoughts heading */}
          <section className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-500">
                Your space
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {activeView === 'feed'
                  ? 'My feed'
                  : 'Recent thoughts'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setActiveView('overview')
              }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </button>
          </section>

          {/* Posts */}
          <section className="mt-4 space-y-4">
            {isLoadingPosts ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
                Loading your posts...
              </div>
            ) : postError ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-12 text-center text-sm text-rose-600">
                {postError}
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <BookOpen size={25} />
                </div>

                <h3 className="mt-4 font-semibold text-slate-800">
                  {posts.length === 0
                    ? 'Your story starts here'
                    : 'No thoughts found'}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {posts.length === 0
                    ? 'Publish your first thought and it will appear here from your database.'
                    : 'Try a different search word or clear your search.'}
                </p>
              </div>
            ) : (
              displayedPosts.map((item, index) => (
                <article
                  key={
                    item.id ||
                    item.post_id ||
                    `${item.thought}-${index}`
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Thought #{posts.length - index}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        From your database
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {item.thought}
                  </p>

                  <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <Heart size={18} />
                      {item.likes_count ??
                        item.like_count ??
                        0}{' '}
                      likes
                    </span>

                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <MessageCircle size={18} />
                      {item.comments_count ??
                        item.comment_count ??
                        0}{' '}
                      replies
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>
        </main>

        {/* Right sidebar */}
        <aside className="hidden w-64 shrink-0 xl:block">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">
              Your rhythm
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              A quiet look at your practice
            </p>

            <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 text-center">
              <div>
                <p className="text-xl font-bold text-slate-800">
                  {posts.length}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Thoughts
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-800">
                  {totalLikes}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Likes
                </p>
              </div>

              <div>
                <p className="text-xl font-bold text-slate-800">
                  {totalComments}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Replies
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Daily intention
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Keep writing and reflecting
                </p>
              </div>

              <CalendarDays
                size={18}
                className="text-indigo-500"
              />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{
                  width: posts.length > 0 ? '100%' : '0%',
                }}
              />
            </div>

            <p className="mt-2 text-xs font-medium text-indigo-600">
              {posts.length > 0 ? 'Thoughts recorded' : 'Start writing today'}
            </p>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">
                Quick view
              </h2>

              <MessageCircle
                size={17}
                className="text-indigo-500"
              />
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-500">
              <p className="flex items-center gap-3">
                <Heart size={17} className="text-rose-400" />
                Keep your ideas close.
              </p>

              <p className="flex items-center gap-3">
                <BookOpen size={17} className="text-indigo-400" />
                Your thoughts come from the database.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Avatar({ user, name, initial, small = false }) {
  const size = small ? 'h-10 w-10' : 'h-9 w-9'

  return user?.USER_PROFILE_PIC ? (
    <img
      src={user.USER_PROFILE_PIC}
      alt={`${name} profile`}
      className={`${size} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`flex ${size} items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700`}
    >
      {initial}
    </div>
  )
}

export default Dashboard