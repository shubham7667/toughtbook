import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpenText,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [thoughts, setThoughts] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong.')
    }

    return data
  }

  const loadAdminData = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [summaryData, userData, thoughtData] = await Promise.all([
        request('/admin/summary'),
        request('/admin/users'),
        request('/admin/thoughts'),
      ])

      setSummary(summaryData)
      setUsers(userData.users || [])
      setThoughts(thoughtData.thoughts || [])
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 2500)

    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.USER_NAME} ${user.USER_EMAIL_ID}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [users, search])

  const filteredThoughts = useMemo(() => {
    return thoughts.filter((thought) =>
      `${thought.thought} ${thought.USER_NAME} ${thought.USER_EMAIL_ID}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [thoughts, search])

  const updateUser = async (userId, update) => {
    try {
      await request(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(update),
      })

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.USER_ID === userId
            ? {
                ...user,
                ROLE: update.role || user.ROLE,
                STATUS: update.status || user.STATUS,
              }
            : user
        )
      )

      setNotice('User account updated')
    } catch (actionError) {
      setError(actionError.message)
    }
  }

  const updateThoughtVisibility = async (thoughtId, isHidden) => {
    try {
      await request(`/admin/thoughts/${thoughtId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_hidden: isHidden,
        }),
      })

      setThoughts((currentThoughts) =>
        currentThoughts.map((thought) =>
          thought.THOUGHT_ID === thoughtId
            ? {
                ...thought,
                IS_HIDDEN: isHidden,
              }
            : thought
        )
      )

      setNotice(isHidden ? 'Thought hidden successfully' : 'Thought restored')
    } catch (actionError) {
      setError(actionError.message)
    }
  }

  const deleteThought = async (thoughtId) => {
    const confirmed = window.confirm(
      'Permanently delete this thought? This cannot be undone.'
    )

    if (!confirmed) return

    try {
      await request(`/admin/thoughts/${thoughtId}`, {
        method: 'DELETE',
      })

      setThoughts((currentThoughts) =>
        currentThoughts.filter(
          (thought) => thought.THOUGHT_ID !== thoughtId
        )
      )

      setNotice('Thought permanently deleted')
    } catch (actionError) {
      setError(actionError.message)
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      navigate('/admin/login')
    }
  }

  const navItems = [
    ['overview', LayoutDashboard, 'Overview'],
    ['users', Users, 'User management'],
    ['content', BookOpenText, 'Content moderation'],
  ]

  const heading =
    activeTab === 'users'
      ? 'User management'
      : activeTab === 'content'
        ? 'Content moderation'
        : 'Platform overview'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {notice && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {notice}
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="font-black tracking-tight text-slate-900">
                THOUGHTBOOK
              </p>
              <p className="text-xs font-semibold text-indigo-600">
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/feed"
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:block"
            >
              View app
            </a>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 sm:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">
            Administration
          </p>

          <nav>
            {navItems.map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveTab(id)
                  setSearch('')
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  activeTab === id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-900 p-4 text-white">
            <BarChart3 size={20} className="mb-4 text-indigo-300" />

            <p className="text-sm font-semibold">Keep the community safe.</p>

            <p className="mt-1 text-xs leading-5 text-slate-300">
              User and content changes should always be reviewed carefully.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {heading}
              </h1>
            </div>

            {activeTab !== 'overview' && (
              <label className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    activeTab === 'users'
                      ? 'Search users...'
                      : 'Search thoughts...'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
                />
              </label>
            )}
          </section>

          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-slate-500">
              <LoaderCircle className="animate-spin" size={20} />
              Loading admin data...
            </div>
          ) : error ? (
            <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6">
              <h2 className="font-bold text-rose-800">
                Admin access unavailable
              </h2>

              <p className="mt-1 text-sm text-rose-700">{error}</p>

              <button
                type="button"
                onClick={loadAdminData}
                className="mt-4 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Try again
              </button>
            </section>
          ) : (
            <>
              {activeTab === 'overview' && (
                <Overview
                  summary={summary}
                  users={users}
                  thoughts={thoughts}
                />
              )}

              {activeTab === 'users' && (
                <UsersTable users={filteredUsers} onUpdate={updateUser} />
              )}

              {activeTab === 'content' && (
                <ThoughtsTable
                  thoughts={filteredThoughts}
                  onVisibility={updateThoughtVisibility}
                  onDelete={deleteThought}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function Overview({ summary, users, thoughts }) {
  const stats = [
    [
      summary?.total_users ?? 0,
      'Total users',
      Users,
      'bg-indigo-50 text-indigo-600',
    ],
    [
      summary?.active_users ?? 0,
      'Active accounts',
      CheckCircle2,
      'bg-emerald-50 text-emerald-600',
    ],
    [
      summary?.total_thoughts ?? 0,
      'All thoughts',
      BookOpenText,
      'bg-violet-50 text-violet-600',
    ],
    [
      summary?.hidden_thoughts ?? 0,
      'Hidden content',
      EyeOff,
      'bg-amber-50 text-amber-600',
    ],
  ]

  return (
    <>
      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([value, label, Icon, color]) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
            >
              <Icon size={20} />
            </div>

            <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Newest users"
          items={users.slice(0, 5)}
          primary="USER_NAME"
          secondary="USER_EMAIL_ID"
        />

        <RecentList
          title="Latest thoughts"
          items={thoughts.slice(0, 5)}
          primary="thought"
          secondary="USER_NAME"
        />
      </section>
    </>
  )
}

function RecentList({ title, items, primary, secondary }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-900">{title}</h2>

      <div className="mt-4 divide-y divide-slate-100">
        {items.length === 0 ? (
          <p className="py-6 text-sm text-slate-400">No data yet.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="py-3">
              <p className="truncate text-sm font-medium text-slate-700">
                {item[primary]}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {item[secondary]}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function UsersTable({ users, onUpdate }) {
  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Joined</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.USER_ID}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.USER_PROFILE_PIC ? (
                      <img
                        src={user.USER_PROFILE_PIC}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                        {user.USER_NAME?.[0]}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.USER_NAME}
                      </p>

                      <p className="text-xs text-slate-400">
                        {user.USER_EMAIL_ID}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      user.ROLE === 'admin'
                        ? 'bg-violet-50 text-violet-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.ROLE}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      user.STATUS === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {user.STATUS}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {user.CREATED_AT
                    ? new Date(user.CREATED_AT).toLocaleDateString()
                    : '—'}
                </td>

                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(user.USER_ID, {
                          role: user.ROLE === 'admin' ? 'member' : 'admin',
                        })
                      }
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {user.ROLE === 'admin' ? 'Make member' : 'Make admin'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(user.USER_ID, {
                          status:
                            user.STATUS === 'active'
                              ? 'suspended'
                              : 'active',
                        })
                      }
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                        user.STATUS === 'active'
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {user.STATUS === 'active' ? 'Suspend' : 'Restore'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && <Empty label="No users match that search." />}
    </section>
  )
}

function ThoughtsTable({ thoughts, onVisibility, onDelete }) {
  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {thoughts.map((thought) => (
          <article key={thought.THOUGHT_ID} className="p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {thought.USER_NAME}

                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {thought.USER_EMAIL_ID}
                  </span>
                </p>

                <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {thought.thought}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  {thought.CREATED_AT
                    ? new Date(thought.CREATED_AT).toLocaleString()
                    : ''}
                </p>

                {thought.IS_HIDDEN && (
                  <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    Hidden from community
                  </span>
                )}
              </div>

              <div className="flex h-fit gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onVisibility(thought.THOUGHT_ID, !thought.IS_HIDDEN)
                  }
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  title={thought.IS_HIDDEN ? 'Restore thought' : 'Hide thought'}
                >
                  {thought.IS_HIDDEN ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(thought.THOUGHT_ID)}
                  className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                  title="Delete thought"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {thoughts.length === 0 && <Empty label="No thoughts match that search." />}
    </section>
  )
}

function Empty({ label }) {
  return <div className="p-12 text-center text-sm text-slate-400">{label}</div>
}