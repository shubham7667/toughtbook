import { useEffect, useState } from 'react'
import Nav from './nav'

import {
  Bookmark,
  Compass,
  Home,
  Bell,
  User,
  PenSquare,
  Image,
  PencilLine,
  Smile,
  BarChart3,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share,
} from 'lucide-react'

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Explore', icon: Compass },
  { label: 'Notifications', icon: Bell },
  { label: 'Bookmarks', icon: Bookmark },
  { label: 'Profile', icon: User },
]

const topicTags = [
  '#Technology',
  '#Selfimprovement',
  '#AI',
  '#Books',
  '#Productivity',
  '#Travel',
  '#MentalHealth',
  '#Startups',
]

const suggestedPeople = [
  { name: 'Ananya Rao', handle: '@ananyarao' },
  { name: 'Karan Malhotra', handle: '@karanmalhotra' },
  { name: 'Isha Verma', handle: '@ishaverma' },
]

const trends = [
  { rank: 1, title: 'Building in Public', count: '12.4K thoughts' },
  { rank: 2, title: 'AI in Everyday Life', count: '9.8K thoughts' },
  { rank: 3, title: 'Study Motivation', count: '8.1K thoughts' },
  { rank: 4, title: 'Minimalism', count: '6.7K thoughts' },
  { rank: 5, title: 'Weekend Getaways', count: '5.2K thoughts' },
]

const FrontPage = () => {
  const [user, setUser] = useState(null)
  const [draft, setDraft] = useState('')
  const [posts, setPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [openComments, setOpenComments] = useState(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [comments, setComments] = useState({})
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [postError, setPostError] = useState('')

  const fetchPosts = async () => {
    setIsLoadingPosts(true)
    setPostError('')

    try {
      const response = await fetch('http://localhost:8000/get/post', {
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || 'Unable to load your feed.')
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPostError('We could not load your feed right now.')
    } finally {
      setIsLoadingPosts(false)
    }
  }

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

        await fetchPosts()
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    getUser()
  }, [])

  const getPostKey = (post, index) => post.id || post.post_id || `${post.thought}-${index}`

  const togglePostList = (setter, postKey) => {
    setter((current) => current.includes(postKey)
      ? current.filter((key) => key !== postKey)
      : [...current, postKey])
  }

  const handleCommentSubmit = (event, postKey) => {
    event.preventDefault()
    const trimmedComment = commentDraft.trim()
    if (!trimmedComment) return

    setComments((current) => ({
      ...current,
      [postKey]: [...(current[postKey] || []), trimmedComment],
    }))
    setCommentDraft('')
  }

  const handleShare = async (post) => {
    try {
      await navigator.clipboard.writeText(post.thought || '')
    } catch (error) {
      console.error('Failed to copy post:', error)
    }
  }

  const userName = user?.USER_NAME || 'Thoughtful writer'
  const userHandle = user?.USER_EMAIL_ID
    ? `@${user.USER_EMAIL_ID.split('@')[0]}`
    : '@you'

  const userInitial = userName.charAt(0).toUpperCase()

  const handlePost = async (event) => {
    event.preventDefault()

    const trimmed = draft.trim()

    if (!trimmed) return

    try {
      const response = await fetch('http://localhost:8000/thought/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          thought: trimmed,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDraft('')
        await fetchPosts()
      } else {
        console.error(data)
      }
    } catch (error) {
      console.error('Failed to post thought:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Nav />

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-5 lg:px-6 xl:px-8">

        {/* LEFT SIDEBAR */}
        <aside className="hidden w-[280px] shrink-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:block">
          <div className="flex flex-col gap-2.5 pt-2">

            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left text-base font-medium text-slate-700 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}

            <button
              type="button"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition hover:bg-indigo-600"
            >
              <PenSquare size={18} />
              <span>New Thought</span>
            </button>

          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 rounded-[28px] border border-slate-200 bg-[#f3f5fb] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.03)] lg:p-5">

          {/* CREATE THOUGHT */}
          <form
            onSubmit={handlePost}
            className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-300 to-slate-600 text-sm font-bold text-white">

                {user?.USER_PROFILE_PIC ? (
                  <img
                    src={user.USER_PROFILE_PIC}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  userInitial
                )}

              </div>

              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                type="text"
                placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                className="h-12 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-100"
                >
                  <Image size={16} className="text-sky-500" />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-100"
                >
                  <PencilLine size={16} className="text-violet-500" />
                  <span>Write</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-100"
                >
                  <Smile size={16} className="text-amber-500" />
                  <span>Feeling</span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-100"
                >
                  <BarChart3 size={16} className="text-emerald-500" />
                  <span>Poll</span>
                </button>

              </div>

              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(79,70,229,0.28)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Post
              </button>

            </div>
          </form>

          {/* FEED TABS — UI ONLY */}
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex border-b border-slate-200 px-4 py-3 text-sm font-medium">

              <button
                type="button"
                className="flex-1 rounded-t-xl border-b-2 border-indigo-500 px-3 py-2.5 text-left font-semibold text-indigo-600"
              >
                For You
              </button>

              <button
                type="button"
                className="flex-1 rounded-t-xl px-3 py-2.5 text-left text-slate-500 hover:bg-slate-50"
              >
                Following
              </button>

              <button
                type="button"
                className="flex-1 rounded-t-xl px-3 py-2.5 text-left text-slate-500 hover:bg-slate-50"
              >
                Latest
              </button>

            </div>
          </div>

          <div className="mt-5 space-y-5">
            {isLoadingPosts ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading your feed...</div>
            ) : postError ? (
              <div className="rounded-[24px] border border-rose-100 bg-rose-50 p-10 text-center text-sm text-rose-600">{postError}</div>
            ) : posts.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                <p className="text-lg font-semibold text-slate-800">Your feed is waiting for its first story.</p>
                <p className="mt-2 text-sm">Share a thought above and it will appear here.</p>
              </div>
            ) : posts.map((post, index) => {
              const postKey = getPostKey(post, index)
              const isLiked = likedPosts.includes(postKey)
              const isSaved = savedPosts.includes(postKey)
              const postComments = comments[postKey] || []

              return (
                <article key={postKey} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
                  <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-bold text-white">
                        {user?.USER_PROFILE_PIC ? <img src={user.USER_PROFILE_PIC} alt={userName} className="h-full w-full object-cover" /> : userInitial}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{post.user_name || userName}</p>
                        <p className="text-xs text-slate-400">{post.created_at || 'Just shared'}</p>
                      </div>
                    </div>
                    <button type="button" aria-label="More post options" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={20} /></button>
                  </div>

                  <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-7">
                    <p className="max-w-3xl text-xl font-semibold leading-9 tracking-tight text-slate-800 sm:text-2xl sm:leading-10">{post.thought}</p>
                  </div>

                  <div className="mx-5 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-300 sm:mx-7" />

                  <div className="flex items-center justify-between px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => togglePostList(setLikedPosts, postKey)} aria-label={isLiked ? 'Unlike post' : 'Like post'} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${isLiked ? 'bg-rose-50 text-rose-500' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-500'}`}><Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />{(post.likes_count ?? post.like_count ?? 0) + (isLiked ? 1 : 0)}</button>
                      <button type="button" onClick={() => setOpenComments(openComments === postKey ? null : postKey)} aria-label="Show comments" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"><MessageCircle size={18} />{(post.comments_count ?? post.comment_count ?? 0) + postComments.length}</button>
                      <button type="button" onClick={() => handleShare(post)} aria-label="Copy post" className="rounded-xl p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"><Share size={18} /></button>
                    </div>
                    <button type="button" onClick={() => togglePostList(setSavedPosts, postKey)} aria-label={isSaved ? 'Unsave post' : 'Save post'} className={`rounded-xl p-2 transition ${isSaved ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}><Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} /></button>
                  </div>

                  {openComments === postKey && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
                      {postComments.length > 0 && <div className="mb-3 space-y-2 text-sm text-slate-600">{postComments.map((comment, commentIndex) => <p key={`${postKey}-comment-${commentIndex}`}><span className="font-semibold text-slate-800">You</span> {comment}</p>)}</div>}
                      <form onSubmit={(event) => handleCommentSubmit(event, postKey)} className="flex gap-2">
                        <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Write a thoughtful reply..." className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50" />
                        <button type="submit" disabled={!commentDraft.trim()} className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300">Reply</button>
                      </form>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden w-[320px] shrink-0 space-y-5 xl:block">

          {/* GREETING */}
          <div className="rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-200 text-lg font-bold text-amber-900">
                ☀️
              </div>

              <div className="text-left">
                <p className="text-sm text-slate-500">
                  Good Afternoon,
                </p>

                <h3 className="text-2xl font-bold text-slate-900">
                  {userName}
                </h3>
              </div>

            </div>

            <div className="overflow-hidden rounded-[22px] bg-gradient-to-br from-sky-200 via-sky-100 to-indigo-100 p-3">
              <div className="h-24 rounded-[18px] bg-gradient-to-b from-slate-400/80 via-slate-500/70 to-slate-700/90" />
            </div>

            <p className="mt-4 text-left text-sm leading-6 text-slate-500">
              Keep sharing your thoughts.
            </p>

            <p className="text-left text-sm leading-6 text-slate-500">
              The world needs your perspective.
            </p>

          </div>

          {/* TOPICS */}
          <div className="rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">

            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900">
                Topics for you
              </h4>

              <button
                type="button"
                className="text-sm font-medium text-indigo-600"
              >
                See all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">

              {topicTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}

            </div>

          </div>

          {/* SUGGESTED PEOPLE */}
          <div className="rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">

            <div className="mb-3 flex items-center justify-between">

              <h4 className="text-lg font-bold text-slate-900">
                Suggested People
              </h4>

              <button
                type="button"
                className="text-sm font-medium text-indigo-600"
              >
                See all
              </button>

            </div>

            <div className="space-y-3">

              {suggestedPeople.map(({ name, handle }) => (
                <div
                  key={handle}
                  className="flex items-center justify-between gap-3"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-sm font-bold text-white">
                      {name.charAt(0)}
                    </div>

                    <div className="text-left">

                      <p className="text-sm font-semibold text-slate-900">
                        {name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {handle}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Follow
                  </button>

                </div>
              ))}

            </div>

          </div>

          {/* QUOTE */}
          <div className="rounded-[28px] bg-[#eef1ff] p-4 shadow-[0_16px_40px_rgba(79,70,229,0.08)]">

            <div className="mb-2 flex items-center justify-between">
              <span className="text-4xl font-bold text-slate-800">
                “
              </span>
            </div>

            <p className="text-left text-lg font-medium leading-relaxed text-slate-800">
              Small thoughts lead to big changes.
            </p>

            <p className="mt-2 text-left text-sm text-slate-500">
              — Unknown
            </p>

          </div>

          {/* TRENDING */}
          <div className="rounded-[28px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">

            <h4 className="text-lg font-bold text-slate-900">
              Trending Today
            </h4>

            <div className="mt-3 space-y-3">

              {trends.map(({ rank, title, count }) => (
                <div
                  key={rank}
                  className="flex items-center gap-3 text-left"
                >

                  <span className="w-5 text-sm font-semibold text-slate-500">
                    {rank}
                  </span>

                  <div className="flex-1">

                    <p className="text-sm font-medium text-slate-800">
                      {title}
                    </p>

                    <p className="text-xs text-slate-500">
                      {count}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </aside>

      </div>
    </div>
  )
}

export default FrontPage