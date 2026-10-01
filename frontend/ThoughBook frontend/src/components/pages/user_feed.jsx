import { useEffect, useState } from "react";
import Nav from "./nav";
import LeftSidebar from "./left_sidebar.jsx";
import RightSidebar from "./right_sidebar.jsx";

import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Bell,
  SlidersHorizontal,
  Plus,
  UserRoundPlus,
} from "lucide-react";


/* =========================
   STORIES
========================= */

function StoriesSection() {
  const stories = [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          Stories
        </h2>

        <button className="text-sm font-medium text-indigo-600">
          See all →
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto">

        {stories.length === 0 ? (

          <div className="flex w-full items-center justify-center py-6 text-sm text-slate-400">
            Stories will appear here.
          </div>

        ) : (

          stories.map((story) => (
            <button
              key={story.id}
              className="flex w-16 shrink-0 flex-col items-center gap-2"
            >
              <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                <div className="rounded-full bg-white p-[2px]">
                  <img
                    src={story.profilePicture}
                    alt={story.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                </div>
              </div>

              <span className="w-full truncate text-center text-xs text-slate-600">
                {story.name}
              </span>
            </button>
          ))

        )}

      </div>

    </section>
  );
}


/* =========================
   PEOPLE YOU MAY KNOW
========================= */

function PeopleYouMayKnow() {

  const people = [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">
          <UserRoundPlus
            size={18}
            className="text-indigo-600"
          />

          <h2 className="font-semibold text-slate-900">
            People you may know
          </h2>
        </div>

        <button className="text-sm font-medium text-indigo-600">
          See all →
        </button>

      </div>


      <div className="flex gap-3 overflow-x-auto">

        {people.length === 0 ? (

          <div className="flex w-full items-center justify-center py-8 text-sm text-slate-400">
            People you may know will appear here.
          </div>

        ) : (

          people.map((person) => (
            <div
              key={person.userId}
              className="min-w-[150px] rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >

              <div className="flex justify-center">
                <img
                  src={person.profilePicture}
                  alt={person.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              </div>

              <p className="mt-3 truncate text-center text-sm font-semibold">
                {person.name}
              </p>

              <button className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white">
                Follow
              </button>

            </div>
          ))

        )}

      </div>

    </section>
  );
}


/* =========================
   FEED FILTERS
========================= */

function FeedFilters({ postCount }) {

  return (
    <div className="flex items-center justify-between">

      <div className="flex gap-2 overflow-x-auto">

        <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white">
          All
        </button>

        <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600">
          Thoughts
        </button>

        <button className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600">
          Photos
        </button>

      </div>

      <span className="ml-4 whitespace-nowrap text-sm text-slate-500">
        {postCount} {postCount === 1 ? "post" : "posts"}
      </span>

    </div>
  );
}


/* =========================
   POST
========================= */

function Post({ post, liked, onLike }) {

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">

      {/* Post Header */}

      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <img
            src={post.USER_PROFILE_PIC}
            alt={post.USER_NAME}
            className="h-11 w-11 rounded-full object-cover"
          />

          <div>

            <p className="text-sm font-semibold text-slate-900">
              {post.USER_NAME}
            </p>

          </div>

        </div>


        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={18} />
        </button>

      </div>


      {/* Thought */}

      <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-slate-700">
        {post.thought}
      </p>


      {/* Actions */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">

        <button
          onClick={onLike}
          className={`flex items-center gap-2 text-sm transition ${
            liked
              ? "text-red-500"
              : "text-slate-500 hover:text-red-500"
          }`}
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
          />
        </button>


        <button className="text-slate-500 hover:text-indigo-600">
          <MessageCircle size={18} />
        </button>


        <button className="text-slate-500 hover:text-indigo-600">
          <Repeat2 size={18} />
        </button>


        <button className="text-slate-500 hover:text-indigo-600">
          <Bookmark size={18} />
        </button>

      </div>

    </article>
  );
}


/* =========================
   FEED PAGE
========================= */

export default function Home() {

  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* =========================
     FETCH FEED
  ========================= */

  useEffect(() => {

    const fetchFeed = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:8000/feed",
          {
            method: "GET",
            credentials: "include",
          }
        );


        if (!response.ok) {
          throw new Error("Failed to fetch feed");
        }


        const data = await response.json();

        setPosts(data.posts || []);

      } catch (error) {

        console.error("Feed fetch failed:", error);

        setError("Unable to load feed.");

      } finally {

        setLoading(false);

      }

    };


    fetchFeed();

  }, []);


  /* =========================
     LIKE
  ========================= */

  const toggleLike = (postId) => {

    setLiked((current) => {

      const updated = new Set(current);

      if (updated.has(postId)) {
        updated.delete(postId);
      } else {
        updated.add(postId);
      }

      return updated;

    });

  };


  return (

    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      <Nav />


      <div className="mx-auto flex h-[calc(100vh-72px)] max-w-[1500px] overflow-hidden">


        {/* =========================
            LEFT SIDEBAR
        ========================= */}

        <LeftSidebar heightClass="h-full" />


        {/* =========================
            CENTER FEED
        ========================= */}

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">

          <div className="mx-auto max-w-[760px]">


            {/* Feed Header */}

            <header className="mb-5 flex items-center justify-between">

              <div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Your Feed
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Latest from people you follow
                </p>

              </div>


              <div className="flex gap-2">

                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                  <Bell size={18} />
                </button>

                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                  <SlidersHorizontal size={18} />
                </button>

              </div>

            </header>


            {/* Stories */}

            <StoriesSection />


            {/* People You May Know */}

            <div className="mt-5">
              <PeopleYouMayKnow />
            </div>


            {/* Feed Filters */}

            <div className="mt-5">
              <FeedFilters postCount={posts.length} />
            </div>


            {/* Posts */}

            <section className="mt-4 space-y-4">


              {/* Loading */}

              {loading && (

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Loading feed...
                </div>

              )}


              {/* Error */}

              {!loading && error && (

                <div className="rounded-2xl border border-red-200 bg-white p-8 text-center text-sm text-red-500">
                  {error}
                </div>

              )}


              {/* Empty */}

              {!loading && !error && posts.length === 0 && (

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

                  <p className="font-medium text-slate-700">
                    Your feed is empty
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Posts from people you follow will appear here.
                  </p>

                </div>

              )}


              {/* Actual Backend Posts */}

              {!loading &&
                !error &&
                posts.map((post) => (

                  <Post
                    key={post.post_id}
                    post={post}
                    liked={liked.has(post.post_id)}
                    onLike={() => toggleLike(post.post_id)}
                  />

                ))}

            </section>

          </div>

        </main>


        {/* =========================
            RIGHT SIDEBAR
        ========================= */}

        <RightSidebar heightClass="h-full" />


      </div>

    </div>
  );
}