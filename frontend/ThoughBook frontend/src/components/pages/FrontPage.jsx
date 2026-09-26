import { useEffect, useState } from 'react'

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
  Share2,
  Search,
  BookOpen,
  MessageSquare,
  Plus,
  Settings,
  Flame,
  Users,
} from 'lucide-react'


// =========================================================
// SAMPLE UI DATA
// =========================================================

const stories = [
  {
    name: 'Your Story',
    image: 'https://i.pravatar.cc/100?img=12',
    own: true,
  },
  {
    name: 'Meera',
    image: 'https://i.pravatar.cc/100?img=47',
  },
  {
    name: 'Rohan',
    image: 'https://i.pravatar.cc/100?img=11',
  },
  {
    name: 'Priya',
    image: 'https://i.pravatar.cc/100?img=32',
  },
  {
    name: 'Aisha',
    image: 'https://i.pravatar.cc/100?img=44',
  },
  {
    name: 'Kabir',
    image: 'https://i.pravatar.cc/100?img=13',
  },
  {
    name: 'Dev',
    image: 'https://i.pravatar.cc/100?img=14',
  },
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
  {
    name: 'Ananya Rao',
    handle: '@ananyarao',
    image: 'https://i.pravatar.cc/100?img=20',
  },
  {
    name: 'Karan Malhotra',
    handle: '@karanmalhotra',
    image: 'https://i.pravatar.cc/100?img=21',
  },
  {
    name: 'Isha Verma',
    handle: '@ishaverma',
    image: 'https://i.pravatar.cc/100?img=22',
  },
  {
    name: 'Rahul Mehta',
    handle: '@rahulmehta',
    image: 'https://i.pravatar.cc/100?img=23',
  },
]


const trends = [
  {
    rank: 1,
    title: 'Building in Public',
    count: '12.4K thoughts',
  },
  {
    rank: 2,
    title: 'AI in Everyday Life',
    count: '9.8K thoughts',
  },
  {
    rank: 3,
    title: 'Study Motivation',
    count: '8.1K thoughts',
  },
  {
    rank: 4,
    title: 'Minimalism',
    count: '6.7K thoughts',
  },
  {
    rank: 5,
    title: 'Weekend Getaways',
    count: '5.2K thoughts',
  },
]


// =========================================================
// NAVIGATION
// =========================================================

const navItems = [
  {
    label: 'Home',
    icon: Home,
    active: true,
  },
  {
    label: 'Explore',
    icon: Compass,
  },
  {
    label: 'Search',
    icon: Search,
  },
  {
    label: 'Stories',
    icon: BookOpen,
  },
  {
    label: 'Gallery',
    icon: Image,
  },
  {
    label: 'Messages',
    icon: MessageSquare,
    badge: 3,
  },
  {
    label: 'Notifications',
    icon: Bell,
    badge: 12,
  },
  {
    label: 'Saved',
    icon: Bookmark,
  },
  {
    label: 'Profile',
    icon: User,
  },
]


// =========================================================
// FRONT PAGE
// =========================================================

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

  const [activeFilter, setActiveFilter] = useState('All')


  // =======================================================
  // FETCH POSTS
  // =======================================================

  const fetchPosts = async () => {

    setIsLoadingPosts(true)

    setPostError('')

    try {

      const response = await fetch(
        'http://localhost:8000/get/post',
        {
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Unable to load your feed.'
        )
      }

      setPosts(data.posts || [])

    } catch (error) {

      console.error(
        'Failed to fetch posts:',
        error
      )

      setPostError(
        'We could not load your feed right now.'
      )

    } finally {

      setIsLoadingPosts(false)

    }
  }


  // =======================================================
  // FETCH CURRENT USER
  // =======================================================

  useEffect(() => {

    const getUser = async () => {

      try {

        const response = await fetch(
          'http://localhost:8000/me',
          {
            credentials: 'include',
          }
        )

        if (response.ok) {

          const data = await response.json()

          setUser(data.user)

        }

        await fetchPosts()

      } catch (error) {

        console.error(
          'Failed to fetch user:',
          error
        )

      }

    }

    getUser()

  }, [])


  // =======================================================
  // POST KEY
  // =======================================================

  const getPostKey = (post) => {
    return post.post_id
  }


  // =======================================================
  // LIKE / SAVE TOGGLE
  // =======================================================

  const togglePostList = (
    setter,
    postKey
  ) => {

    setter((current) =>

      current.includes(postKey)

        ? current.filter(
            (key) => key !== postKey
          )

        : [
            ...current,
            postKey
          ]

    )

  }


  // =======================================================
  // COMMENT
  // =======================================================

const handleCommentSubmit = async (
    event,
    postId
  ) => {

    event.preventDefault()

    const trimmedComment =
      commentDraft.trim()

    if (!trimmedComment) {
      return
    }

    try {

      const response = await fetch(
        `http://localhost:8000/thought/${postId}/comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            comment: trimmedComment,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Comment API error:', data)
        return
      }

      await loadComments(postId)
      setCommentDraft('')

    } catch (error) {
      console.error('Comment request failed:', error)
    }
  }


  // =======================================================
  // LOAD COMMENTS
  // =======================================================

  const loadComments = async (postId) => {

    try {

      const response = await fetch(
        `http://localhost:8000/thought/${postId}/comments`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to load comments:', data)
        return
      }

      setComments((current) => ({
        ...current,
        [postId]: data.comments || [],
      }))

    } catch (error) {
      console.error('Comment loading failed:', error)
    }
  }


  // =======================================================
  // SHARE
  // =======================================================

  const handleShare = async (post) => {

    try {

      await navigator.clipboard.writeText(
        post.thought || ''
      )

    } catch (error) {

      console.error(
        'Failed to copy post:',
        error
      )

    }

  }

  const handleLike = async (postId) => {

  const isCurrentlyLiked =
    likedPosts.includes(postId)

  try {

    const response = await fetch(
      `http://localhost:8000/thought/${postId}/like`,
      {
        method: isCurrentlyLiked
          ? 'DELETE'
          : 'POST',

        credentials: 'include'
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return
    }

    // Update liked state
    setLikedPosts((current) => {

      if (data.liked) {

        return current.includes(postId)
          ? current
          : [...current, postId]

      }

      return current.filter(
        (id) => id !== postId
      )

    })

    // Update like count in the post
    setPosts((currentPosts) =>

      currentPosts.map((post) => {

        if (post.post_id !== postId) {
          return post
        }

        return {
          ...post,
          likes_count: data.like_count
        }

      })

    )

  } catch (error) {

    console.error(
      'Like request failed:',
      error
    )

  }
}


  // =======================================================
  // USER DETAILS
  // =======================================================

  const userName =
    user?.USER_NAME ||
    'Thoughtful writer'


  const userHandle =
    user?.USER_EMAIL_ID
      ? `@${user.USER_EMAIL_ID.split('@')[0]}`
      : '@you'


  const userInitial =
    userName.charAt(0).toUpperCase()


  // =======================================================
  // CREATE POST
  // =======================================================

  const handlePost = async (event) => {

    event.preventDefault()

    const trimmed =
      draft.trim()

    if (!trimmed) {
      return
    }

    try {

      const response = await fetch(
        'http://localhost:8000/thought/post',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify({
            thought: trimmed,
          }),
        }
      )

      const data =
        await response.json()

      if (response.ok) {

        setDraft('')

        await fetchPosts()

      } else {

        console.error(data)

      }

    } catch (error) {

      console.error(
        'Failed to post thought:',
        error
      )

    }

  }


  // =======================================================
  // FILTERED POSTS
  // =======================================================

  const displayedPosts = posts


  // =======================================================
  // UI
  // =======================================================

  return (

    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">

      <div className="flex min-h-screen">


        {/* ================================================= */}
        {/* LEFT SIDEBAR */}
        {/* ================================================= */}

        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[238px] border-r border-indigo-100 bg-white lg:flex lg:flex-col">

          {/* BRAND */}

          <div className="px-6 pt-7">

            <h1 className="font-serif text-[25px] font-bold tracking-tight text-indigo-600">
              ThoughtBook
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              share your soul
            </p>

          </div>


          {/* CREATE POST */}

          <div className="px-4">

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById('create-thought')
                  ?.focus()
              }}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(79,70,229,0.25)] transition hover:from-indigo-600 hover:to-violet-600"
            >

              <Plus size={18} />

              Create Post

            </button>

          </div>


          {/* NAVIGATION */}

          <nav className="mt-5 space-y-1.5 px-4">

            {navItems.map(
              ({
                label,
                icon: Icon,
                active,
                badge,
              }) => (

                <button
                  key={label}
                  type="button"
                  className={`
                    flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition
                    ${
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }
                  `}
                >

                  <Icon size={19} />

                  <span>
                    {label}
                  </span>

                  {badge && (

                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                      {badge}
                    </span>

                  )}

                </button>

              )
            )}

          </nav>


          {/* BOTTOM PROFILE */}

          <div className="mt-auto p-4">

            <div className="rounded-2xl border border-indigo-100 bg-white p-3">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-400 bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">

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


                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-slate-900">
                    {userName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {userHandle}
                  </p>

                </div>


                <button
                  type="button"
                  className="ml-auto text-slate-400 hover:text-indigo-600"
                >

                  <Settings size={17} />

                </button>

              </div>

            </div>

          </div>

        </aside>


        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <main className="ml-0 min-w-0 flex-1 lg:ml-[238px] xl:mr-[310px]">

          <div className="mx-auto max-w-[850px] px-4 py-6 sm:px-6 lg:px-8">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="mb-5">

              <h2 className="font-serif text-[25px] font-bold text-slate-900">
                Your Feed
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest from people you follow
              </p>

            </div>


            {/* ================================================= */}
            {/* STORIES */}
            {/* ================================================= */}

            <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">

              <div className="flex gap-5 overflow-x-auto pb-1">

                {stories.map(
                  (story, index) => (

                    <div
                      key={story.name}
                      className="flex w-[58px] shrink-0 flex-col items-center"
                    >

                      <div
                        className={`
                          relative h-[58px] w-[58px] rounded-full p-[2px]
                          ${
                            story.own
                              ? 'bg-slate-200'
                              : 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-sky-400'
                          }
                        `}
                      >

                        <div className="h-full w-full rounded-full border-2 border-white">

                          <img
                            src={story.image}
                            alt={story.name}
                            className="h-full w-full rounded-full object-cover"
                          />

                        </div>


                        {story.own && (

                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white">

                            <Plus size={11} />

                          </span>

                        )}

                      </div>


                      <p className="mt-2 w-full truncate text-center text-[11px] text-slate-600">

                        {story.name}

                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* ================================================= */}
            {/* FILTERS */}
            {/* ================================================= */}

            <div className="mt-5 flex gap-2 overflow-x-auto">

              {[
                'All',
                '✦ Shayari',
                '◈ Thoughts',
                '◎ Photos',
              ].map((filter) => (

                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`
                    shrink-0 rounded-full px-5 py-2 text-xs font-medium transition
                    ${
                      activeFilter === filter
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'border border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50'
                    }
                  `}
                >

                  {filter}

                </button>

              ))}

            </div>


            {/* ================================================= */}
            {/* CREATE THOUGHT */}
            {/* ================================================= */}

            <form
              onSubmit={handlePost}
              className="mt-5 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-300 bg-gradient-to-br from-indigo-400 to-violet-500 font-bold text-white">

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
                  id="create-thought"
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value)
                  }
                  type="text"
                  placeholder={`What's on your mind, ${userName.split(' ')[0]}?`}
                  className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

              </div>


              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                <div className="flex gap-1">

                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
                  >

                    <Image
                      size={16}
                      className="text-sky-500"
                    />

                    Photo

                  </button>


                  <button
                    type="button"
                    className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:bg-violet-50 hover:text-violet-600 sm:flex"
                  >

                    <PencilLine
                      size={16}
                      className="text-violet-500"
                    />

                    Write

                  </button>


                  <button
                    type="button"
                    className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 md:flex"
                  >

                    <Smile
                      size={16}
                      className="text-amber-500"
                    />

                    Feeling

                  </button>

                </div>


                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="rounded-xl bg-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >

                  Post

                </button>

              </div>

            </form>


            {/* ================================================= */}
            {/* POSTS */}
            {/* ================================================= */}

            <div className="mt-5 space-y-5">

              {isLoadingPosts ? (

                <div className="rounded-2xl border border-indigo-100 bg-white p-10 text-center text-sm text-slate-500">

                  Loading your feed...

                </div>

              ) : postError ? (

                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-10 text-center text-sm text-rose-600">

                  {postError}

                </div>

              ) : displayedPosts.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                  <p className="text-lg font-semibold text-slate-800">

                    Your feed is waiting for its first story.

                  </p>

                  <p className="mt-2 text-sm text-slate-500">

                    Share a thought above and it will appear here.

                  </p>

                </div>

              ) : (

                displayedPosts.map(
                  (post, index) => {

                    const postKey =
                      getPostKey(post)

                    const isLiked =
                      likedPosts.includes(
                        postKey
                      )

                    const isSaved =
                      savedPosts.includes(
                        postKey
                      )

                    const postComments =
                      comments[postKey] || []


                    return (

                      <article
                        key={postKey}
                        className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition hover:shadow-md"
                      >

                        {/* POST HEADER */}

                        <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-300 bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">

                              {user?.USER_PROFILE_PIC ? (

                                <img
                                  src={
                                    user.USER_PROFILE_PIC
                                  }
                                  alt={userName}
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                userInitial

                              )}

                            </div>


                            <div>

                              <div className="flex items-center gap-1.5">

                                <p className="text-sm font-bold text-slate-900">

                                  {post.user_name ||
                                    userName}

                                </p>

                                <span className="text-xs text-indigo-500">
                                  ✓
                                </span>

                              </div>


                              <p className="text-xs text-slate-400">

                                {post.user_handle ||
                                  userHandle}

                                {' · '}

                                {post.created_at ||
                                  'Just now'}

                              </p>

                            </div>

                          </div>


                          <button
                            type="button"
                            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >

                            <MoreHorizontal
                              size={20}
                            />

                          </button>

                        </div>


                        {/* CATEGORY */}

                        <div className="px-5 sm:px-6">

                          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-semibold text-indigo-600">

                            ✦ thoughts

                          </span>

                        </div>


                        {/* CONTENT */}

                        <div className="px-5 pb-5 pt-4 sm:px-6">

                          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5">

                            <p className="whitespace-pre-line font-serif text-[17px] leading-8 text-slate-800">

                              {post.thought}

                            </p>

                          </div>


                          {/* TAGS */}

                          <div className="mt-3 flex flex-wrap gap-2">

                            {[
                              '#thoughts',
                              '#mindset',
                            ].map((tag) => (

                              <span
                                key={tag}
                                className="rounded-full bg-slate-50 px-3 py-1 text-[10px] text-slate-500"
                              >

                                {tag}

                              </span>

                            ))}

                          </div>

                        </div>


                        {/* ACTION BAR */}

                        <div className="flex items-center border-t border-slate-100 px-4 py-2 sm:px-5">

                          <button
                            type="button"
                            onClick={() => handleLike(postKey)}
                            className={`
                              flex items-center gap-2 rounded-xl px-3 py-2
                              text-sm font-medium transition
                              ${
                                isLiked
                                  ? 'bg-rose-50 text-rose-500'
                                  : 'text-slate-500 hover:bg-rose-50 hover:text-rose-500'
                              }
                            `}
                          >
                            <Heart
                              size={18}
                              fill={
                                isLiked
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />

                            {post.likes_count ?? 0}
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              const willOpen =
                                openComments !== postKey

                              setOpenComments(
                                willOpen ? postKey : null
                              )

                              if (willOpen) {
                                loadComments(postKey)
                              }
                            }}
                            aria-label="Show comments"
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <MessageCircle size={18} />

                            {
                              post.comments_count ??
                              post.comment_count ??
                              postComments.length
                            }
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleShare(post)
                            }
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
                          >

                            <Share2
                              size={18}
                            />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              togglePostList(
                                setSavedPosts,
                                postKey
                              )
                            }
                            className={`
                              ml-auto rounded-xl p-2 transition
                              ${
                                isSaved
                                  ? 'bg-amber-50 text-amber-500'
                                  : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'
                              }
                            `}
                          >

                            <Bookmark
                              size={18}
                              fill={
                                isSaved
                                  ? 'currentColor'
                                  : 'none'
                              }
                            />

                          </button>

                        </div>


                        {/* COMMENTS */}

                        {openComments === postKey && (

                          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">

                            {postComments.length > 0 && (

                              <div className="mb-4 space-y-3">

                                {postComments.map(
                                  (comment, commentIndex) => (
                                    <div
                                      key={
                                        comment.comment_id ||
                                        `${postKey}-comment-${commentIndex}`
                                      }
                                      className="flex gap-3"
                                    >
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-xs font-bold text-white">
                                        {comment.USER_PROFILE_PIC ? (
                                          <img
                                            src={comment.USER_PROFILE_PIC}
                                            alt={comment.USER_NAME || 'User'}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          (comment.USER_NAME || 'U')
                                            .charAt(0)
                                            .toUpperCase()
                                        )}
                                      </div>

                                      <div className="rounded-2xl bg-white px-3 py-2">
                                        <p className="text-xs font-semibold text-slate-800">
                                          {comment.USER_NAME || 'User'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                          {comment.comment}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}

                              </div>

                            )}


                            <form
                              onSubmit={(event) =>
                                handleCommentSubmit(
                                  event,
                                  postKey
                                )
                              }
                              className="flex gap-2"
                            >

                              <input
                                value={commentDraft}
                                onChange={(event) =>
                                  setCommentDraft(
                                    event.target.value
                                  )
                                }
                                placeholder="Write a thoughtful reply..."
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                              />

                              <button
                                type="submit"
                                disabled={
                                  !commentDraft.trim()
                                }
                                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >

                                Reply

                              </button>

                            </form>

                          </div>

                        )}

                      </article>

                    )

                  }
                )

              )}

            </div>

          </div>

        </main>


        {/* ================================================= */}
        {/* RIGHT SIDEBAR */}
        {/* ================================================= */}

        <aside className="fixed right-0 top-0 hidden h-screen w-[310px] overflow-y-auto border-l border-indigo-100 bg-white px-5 py-5 xl:block">


          {/* PROFILE CARD */}

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-500 bg-gradient-to-br from-indigo-400 to-violet-500 font-bold text-white">

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


              <div className="min-w-0">

                <h3 className="truncate text-sm font-bold text-slate-900">

                  {userName}

                </h3>

                <p className="truncate text-xs text-slate-500">

                  {userHandle}

                </p>

              </div>

            </div>


            <div className="mt-5 grid grid-cols-3 text-center">

              <div>

                <p className="text-sm font-bold text-slate-900">
                  142
                </p>

                <p className="text-[10px] text-slate-500">
                  Posts
                </p>

              </div>


              <div>

                <p className="text-sm font-bold text-slate-900">
                  3.8k
                </p>

                <p className="text-[10px] text-slate-500">
                  Followers
                </p>

              </div>


              <div>

                <p className="text-sm font-bold text-slate-900">
                  284
                </p>

                <p className="text-[10px] text-slate-500">
                  Following
                </p>

              </div>

            </div>

          </div>


          {/* TRENDING */}

          <div className="mt-7">

            <div className="mb-4 flex items-center gap-2">

              <Flame
                size={16}
                className="text-indigo-500"
              />

              <h3 className="text-xs font-bold tracking-wide text-slate-500">
                TRENDING
              </h3>

            </div>


            <div className="space-y-4">

              {trends.map(
                ({
                  rank,
                  title,
                  count,
                }) => (

                  <div
                    key={rank}
                    className="cursor-pointer rounded-xl px-3 py-2 transition hover:bg-indigo-50"
                  >

                    <div className="flex items-start gap-3">

                      <span className="text-xs font-semibold text-slate-400">
                        {rank}
                      </span>

                      <div>

                        <p className="text-sm font-semibold text-slate-800">
                          {title}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {count}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* SUGGESTED */}

          <div className="mt-7">

            <div className="mb-4 flex items-center gap-2">

              <Users
                size={16}
                className="text-indigo-500"
              />

              <h3 className="text-xs font-bold tracking-wide text-slate-500">
                SUGGESTED
              </h3>

            </div>


            <div className="space-y-4">

              {suggestedPeople.map(
                ({
                  name,
                  handle,
                  image,
                }) => (

                  <div
                    key={handle}
                    className="flex items-center gap-3"
                  >

                    <img
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />


                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-semibold text-slate-900">
                        {name}
                      </p>

                      <p className="truncate text-[10px] text-slate-500">
                        {handle}
                      </p>

                    </div>


                    <button
                      type="button"
                      className="rounded-full border border-indigo-300 px-3 py-1 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                    >

                      Follow

                    </button>

                  </div>

                )
              )}

            </div>

          </div>


          {/* FOOTER */}

          <div className="mt-12 text-center text-[10px] text-slate-400">

            ThoughtBook © 2026 · Privacy · Terms

          </div>

        </aside>

      </div>

    </div>

  )
}


export default FrontPage