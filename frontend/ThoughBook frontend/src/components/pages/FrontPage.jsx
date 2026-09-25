
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  Compass,
  Home,
  Bell,
  User,
  PenSquare,
  Search,
  BookOpen,
  Image,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
  Camera,
  Link as LinkIcon,
  CalendarDays,
  Edit3,
  Grid2X2,
  Feather,
  Clock3,
  Plus,
  Settings,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const navItems = [
  { label: "Home", icon: Home },
  { label: "Explore", icon: Compass },
  { label: "Search", icon: Search },
  { label: "Stories", icon: BookOpen },
  { label: "Gallery", icon: Image },
  { label: "Messages", icon: MessageCircle },
  { label: "Notifications", icon: Bell },
  { label: "Saved", icon: Bookmark },
  { label: "Profile", icon: User },
];

const tabs = [
  { label: "Posts", icon: Grid2X2 },
  { label: "Shayari", icon: Feather },
  { label: "Stories", icon: BookOpen },
  { label: "Liked", icon: Heart },
  { label: "Saved", icon: Bookmark },
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Posts");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [openPostMenu, setOpenPostMenu] = useState(null);
  const [error, setError] = useState("");

  // ThoughtBook Says shown to every logged-in user.
  const [thoughtbookSays, setThoughtbookSays] = useState(null);
  const [isThoughtLoading, setIsThoughtLoading] = useState(true);
  const [thoughtError, setThoughtError] = useState("");
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const navigate = useNavigate();

  const handleDeletePost = async (post) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post.'
    );

    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/post/${post.post_id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to Delete Post')
      }
      setPosts((currentPosts) =>
        currentPosts.filter(
          (item) => item.post_id !== post.post_id
        )
      );
      setOpenPostMenu(null);
    } catch (error) {
      console.error(error);
      alert('Unable to delete Post.');
    }
  }

  // --------------------------------------------------
  // GET PROFILE + POSTS
  // --------------------------------------------------

  const fetchProfileData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const userResponse = await fetch(`${API_URL}/me`, {
        credentials: "include",
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          userData.detail || "Unable to load profile."
        );
      }

      // USER_PROFILE_PIC comes from MySQL.
      //
      // New user:
      // Google picture is stored here.
      //
      // User changed picture:
      // Cloudinary URL is stored here.
      //
      // Therefore this is always our source of truth.
      setUser(userData.user);

      const postResponse = await fetch(`${API_URL}/get/post`, {
        credentials: "include",
      });

      const postData = await postResponse.json();

      if (!postResponse.ok) {
        throw new Error(
          postData.detail || "Unable to load posts."
        );
      }

      setPosts(postData.posts || []);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(
        err.message || "Unable to load your profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // --------------------------------------------------
  // THOUGHTBOOK SAYS
  // --------------------------------------------------

  const fetchThoughtbookSays = async () => {
    setIsThoughtLoading(true);
    setThoughtError("");

    try {
      const response = await fetch(
        `${API_URL}/thoughtbook-says/current`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load ThoughtBook Says."
        );
      }

      setThoughtbookSays(data.thought || null);
    } catch (err) {
      console.error("Failed to load ThoughtBook Says:", err);
      setThoughtError(
        err.message || "Unable to load ThoughtBook Says."
      );
    } finally {
      setIsThoughtLoading(false);
    }
  };

  useEffect(() => {
    fetchThoughtbookSays();

    // Refresh periodically so an expired thought disappears without
    // requiring the user to reload the page.
    const intervalId = window.setInterval(
      fetchThoughtbookSays,
      5 * 60 * 1000
    );

    return () => window.clearInterval(intervalId);
  }, []);

  // --------------------------------------------------
  // USER DATA
  // --------------------------------------------------

  const userName =
    user?.USER_NAME || "Your profile";

  const userEmail =
    user?.USER_EMAIL_ID || "";

  const userHandle = userEmail
    ? `@${userEmail.split("@")[0]}`
    : "@yourhandle";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const profileBio =
    user?.USER_BIO ||
    user?.bio ||
    "Writing thoughtful updates, one moment at a time.";

  const profileLocation =
    user?.USER_LOCATION || user?.location || "";

  const profileWebsite =
    user?.USER_WEBSITE || user?.website || "";

  const profileQuote =
    user?.USER_QUOTE || user?.quote || "";

  // --------------------------------------------------
  // PROFILE PICTURE
  // --------------------------------------------------
  //
  // IMPORTANT:
  //
  // We don't check whether the user is new here.
  //
  // MySQL USER_PROFILE_PIC is the source of truth.
  //
  // New Google user:
  //     Google profile picture URL
  //
  // Changed profile picture:
  //     Cloudinary URL
  //
  // Future login:
  //     Existing DB URL
  //
  // So this automatically displays the correct image.
  // --------------------------------------------------

  const profilePicture =
    user?.USER_PROFILE_PIC || null;

  // --------------------------------------------------
  // CHANGE PROFILE PICTURE
  // --------------------------------------------------

  const isSupportedImageFile = (file) => {
    if (!file) {
      return false;
    }

    const fileName = (file.name || "").toLowerCase();
    const allowedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".gif",
      ".bmp",
      ".heic",
      ".heif",
      ".heics",
      ".heifs",
    ];

    const hasAllowedExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    return file.type.startsWith("image/") || hasAllowedExtension;
  };

  const handleProfilePhotoSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isSupportedImageFile(file)) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/profile/update-photo`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to update profile photo."
        );
      }

      // Cloudinary URL returned by FastAPI
      const cloudinaryUrl =
        data.profile_pic_url;

      if (!cloudinaryUrl) {
        throw new Error(
          "Profile picture URL was not returned."
        );
      }

      // Update React immediately.
      setUser((previousUser) => ({
        ...previousUser,
        USER_PROFILE_PIC: cloudinaryUrl,
      }));

    } catch (err) {
      console.error(
        "Failed to update profile photo:",
        err
      );

      setError(
        err.message ||
        "Unable to update profile photo."
      );
    } finally {
      setIsUploading(false);

      // Allows selecting the same image again.
      event.target.value = "";
    }
  };

  const handleCoverPhotoSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isSupportedImageFile(file)) {
      setError("Please upload a valid image file.");
      event.target.value = "";
      return;
    }
    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/profile/update-cover`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to upload cover photo.");
      }

      const cloudinaryUrl = data.cover_pic_url;

      if (!cloudinaryUrl) {
        throw new Error("Cover photo URL was not returned.");
      }

      setUser((previousUser) => ({
        ...previousUser,
        USER_COVER_PIC: cloudinaryUrl,
      }));
    } catch (err) {
      console.error("Failed to update cover photo:", err);

      setError(
        err.message || "Unable to update cover photo."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  // --------------------------------------------------
  // SHARE POST
  // --------------------------------------------------

  const handleShare = async (thought) => {
    try {
      await navigator.clipboard.writeText(
        thought || ""
      );
    } catch (err) {
      console.error(
        "Failed to copy post:",
        err
      );
    }
  };

  // --------------------------------------------------
  // POST KEY
  // --------------------------------------------------

  const getPostKey = (post, index) =>
    post.post_id ||
    post.id ||
    `${post.thought}-${index}`;

  // --------------------------------------------------
  // PROFILE IMAGE COMPONENT
  // --------------------------------------------------

  const ProfileImage = ({ small = false }) => {
    if (!profilePicture) {
      return (
        <div
          className={
            small
              ? "flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-base font-semibold text-indigo-600"
              : "flex h-full w-full items-center justify-center text-4xl font-semibold tracking-tight text-indigo-600"
          }
        >
          {userInitial}
        </div>
      );
    }

    return (
      <img
        src={profilePicture}
        alt={`${userName}'s profile`}
        className={
          small
            ? "h-12 w-12 rounded-full object-cover"
            : "h-full w-full rounded-full object-cover"
        }
        onError={(event) => {
          console.error("Profile image failed to load:", profilePicture);

          event.currentTarget.onerror = null;
          event.currentTarget.src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName
            )}&background=e0e7ff&color=4f46e5`;
        }}
      />
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="h-screen overflow-hidden bg-[#f4f6fc] text-[15px] leading-normal text-slate-800 antialiased">

      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden">

        {/* ==========================================
            LEFT SIDEBAR
        ========================================== */}

        <aside className="hidden h-screen w-[260px] shrink-0 overflow-hidden border-r border-slate-200 bg-white px-3 py-3 lg:block">

          <div className="flex h-full flex-col overflow-hidden">

            {/* LOGO */}

            <div className="px-1 pt-1">

              <h1 className="font-serif text-[32px] font-bold leading-none tracking-[-0.03em] text-indigo-600">
                ThoughtBook
              </h1>

              <p className="mt-2 text-[13px] font-normal tracking-[0.01em] text-slate-400">
                capture what matters
              </p>

            </div>

            {/* CREATE POST */}

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-indigo-500 px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:bg-indigo-600"
            >
              <PenSquare size={17} />
              Create Post
            </button>

            {/* NAVIGATION */}

            <nav className="mt-5 flex-1 space-y-1.5 overflow-hidden">

              {navItems.map(
                ({ label, icon: Icon }) => (

                  <button
                    key={label}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[15px] tracking-[-0.01em] transition ${label === "Profile"
                      ? "bg-indigo-50 font-semibold text-indigo-600"
                      : "font-normal text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                  >

                    <Icon
                      size={18}
                      strokeWidth={label === "Profile" ? 2.2 : 1.8}
                    />

                    <span>{label}</span>

                  </button>

                )
              )}

            </nav>

            {/* USER */}

            <div className="mt-3 border-t border-slate-200 pt-3">

              <div className="flex items-center gap-3 rounded-2xl px-1 py-2">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-400 bg-indigo-50">

                  <ProfileImage small />

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-slate-900">
                    {userName}
                  </p>

                  <p className="truncate text-[13px] font-normal text-slate-500">
                    {userHandle}
                  </p>

                </div>

                <button
                  type="button"
                  aria-label="Settings"
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Settings size={18} />
                </button>

              </div>

            </div>

          </div>

        </aside>

        {/* ==========================================
            MAIN PROFILE
        ========================================== */}

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">

          {/* COVER */}

          <section className="relative h-70 overflow-hidden bg-linear-to-br from-indigo-950 via-slate-800 to-slate-500">

            {user?.USER_COVER_PIC && (
              <img
                src={user.USER_COVER_PIC}
                alt="Cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*,.heic,.heif,.heics,.heifs"
              onChange={handleCoverPhotoSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/30 bg-slate-900/30 px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white backdrop-blur-md transition hover:bg-slate-900/50"
            >
              <Camera size={17} />
              Edit Cover
            </button>

          </section>

          {/* PROFILE INFORMATION */}

          <section className="relative bg-[#f4f6fc] px-5 pb-6 sm:px-8 xl:px-12">

            <div className="mx-auto max-w-270">

              {/* PROFILE IMAGE + BUTTONS */}

              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between">

                <div className="relative -mt-16">

                  <div className="relative h-32 w-32 rounded-full border-2 border-[#f4f6fc] bg-white p-1 shadow-lg">

                    <div className="h-full w-full overflow-hidden rounded-full bg-linear-to-br from-indigo-200 to-slate-300">

                      <ProfileImage />

                    </div>

                    {/* FILE INPUT */}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*,.heic,.heif,.heics,.heifs"
                      onChange={handleProfilePhotoSelect}
                      className="hidden"
                    />

                    {/* CAMERA */}

                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() =>
                        photoInputRef.current?.click()
                      }
                      aria-label="Change profile photo"
                      className="absolute -bottom-2 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f4f6fc] bg-indigo-500 text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Camera size={15} />
                    </button>

                  </div>

                  {isUploading && (
                    <p className="absolute top-34 left-0 whitespace-nowrap text-[12px] font-semibold text-indigo-600">
                      Uploading...
                    </p>
                  )}

                </div>

                {/* ACTION BUTTONS */}

                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    <Share2 size={17} />
                    Share
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-sm transition hover:bg-indigo-600"
                    onClick={() => { navigate("/edit_profile"); }}
                  >
                    <Edit3 size={17} />
                    Edit Profile
                  </button>

                  <button
                    type="button"
                    aria-label="More profile options"
                    className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:bg-slate-50"
                  >
                    <MoreHorizontal size={19} />
                  </button>

                </div>

              </div>

              {/* USER INFORMATION */}

              <div className="mt-5">

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-slate-900">
                    {userName}
                  </h2>

                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold leading-none text-white">
                    ✓
                  </span>

                </div>

                <p className="mt-1 text-[15px] font-normal text-slate-500">
                  {userHandle}
                </p>

                <p className="mt-4 max-w-xl text-[15px] font-normal leading-6 text-slate-700">
                  {profileBio || (
                    <a href="/edit_profile" className="font-medium text-blue-500">
                      update your bio
                    </a>
                  )}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500">

                  {profileLocation && (
                    <span className="inline-flex items-center gap-1.5">
                      <Feather size={16} />
                      {profileLocation}
                    </span>
                  )}

                  {profileWebsite && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-600">
                      <LinkIcon size={15} />
                      {profileWebsite}
                    </span>
                  )}

                  {profileQuote && (
                    <span className="inline-flex items-center gap-1.5 font-normal italic text-slate-500">
                      <CalendarDays size={15} />
                      “{profileQuote}”
                    </span>
                  )}

                  {!profileLocation && !profileWebsite && !profileQuote && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      ThoughtBook member
                    </span>
                  )}

                </div>

              </div>

              {/* ======================================
                  STATS
              ====================================== */}

              <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4">

                <div className="border-b border-slate-200 px-4 py-4 text-center sm:border-b-0 sm:border-r">

                  <p className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-slate-900">
                    {posts.length}
                  </p>

                  <p className="mt-0.5 text-[13px] font-normal text-slate-500">
                    Posts
                  </p>

                </div>

                <div className="border-b border-slate-200 px-4 py-4 text-center sm:border-b-0 sm:border-r">

                  <p className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-slate-900">
                    0
                  </p>

                  <p className="mt-0.5 text-[13px] font-normal text-slate-500">
                    Followers
                  </p>

                </div>

                <div className="border-b border-slate-200 px-4 py-4 text-center sm:border-b-0 sm:border-r">

                  <p className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-slate-900">
                    0
                  </p>

                  <p className="mt-0.5 text-[13px] font-normal text-slate-500">
                    Following
                  </p>

                </div>

                <div className="px-4 py-4 text-center">

                  <p className="text-[20px] font-bold tabular-nums tracking-[-0.02em] text-slate-900">
                    0
                  </p>

                  <p className="mt-0.5 text-[13px] font-normal text-slate-500">
                    Liked
                  </p>

                </div>

              </div>

              {/* HIGHLIGHT */}

              <div className="mt-7 flex gap-5 overflow-x-auto pb-2">

                <button
                  type="button"
                  className="group flex min-w-18 shrink-0 flex-col items-center gap-2"
                >

                  <div className="flex h-19 w-19 items-center justify-center rounded-full border-2 border-dashed border-indigo-200 bg-transparent shadow-sm transition group-hover:border-indigo-400">

                    <Plus
                      size={23}
                      className="text-slate-500"
                    />

                  </div>

                  <span className="text-[12px] font-medium text-slate-600">
                    New
                  </span>

                </button>

              </div>

              {/* TABS */}

              <div className="mt-5 overflow-x-auto border-b border-slate-200">

                <div className="flex min-w-max">

                  {tabs.map(
                    ({ label, icon: Icon }) => (

                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setActiveTab(label)
                        }
                        className={`flex items-center gap-2 border-b-2 px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] transition ${activeTab === label
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-400 hover:text-slate-800"
                          }`}
                      >

                        <Icon size={16} strokeWidth={activeTab === label ? 2.2 : 1.8} />

                        {label}

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* ======================================
                  CONTENT
              ====================================== */}

              {isLoading ? (

                <div className="py-16 text-center text-[14px] font-normal text-slate-500">
                  Loading your profile...
                </div>

              ) : error ? (

                <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-8 text-center text-[14px] font-medium text-rose-600">
                  {error}
                </div>

              ) : activeTab === "Posts" ? (

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                  {posts.length > 0 ? (

                    posts.map((post, index) => (

                      <article
                        key={getPostKey(
                          post,
                          index
                        )}
                        className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${index % 4 === 0
                          ? "min-h-70"
                          : "min-h-52.5"
                          }`}
                      >

                        <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-indigo-500 via-violet-400 to-sky-300" />

                        <div className="flex h-full flex-col p-6">

                          <div className="flex items-center justify-between">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                              <BookOpen size={20} />
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPostMenu(
                                    openPostMenu === getPostKey(post, index)
                                      ? null
                                      : getPostKey(post, index)
                                  )
                                }
                                aria-label="More post options"
                                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openPostMenu === getPostKey(post, index) && (
                                <div className="absolute right-0 top-10 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 size={15} />
                                    Delete
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleShare(post.thought)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                  >
                                    <Share2 size={15} />
                                    Share
                                  </button>

                                </div>
                              )}
                            </div>

                          </div>

                          <p className="mt-auto pt-8 font-serif text-[19px] font-normal leading-8 tracking-[-0.01em] text-slate-800">
                            {post.thought}
                          </p>

                          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[12px] font-medium text-slate-400">

                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={13} />
                              {post.created_at ||
                                "Shared thought"}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleShare(
                                  post.thought
                                )
                              }
                              className="rounded-full p-2 transition hover:bg-indigo-50 hover:text-indigo-600"
                              aria-label="Share thought"
                            >
                              <Share2 size={15} />
                            </button>

                          </div>

                        </div>

                      </article>

                    ))

                  ) : (

                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                        <BookOpen size={25} />
                      </div>

                      <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-slate-800">
                        Your story starts here
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-[14px] font-normal leading-6 text-slate-500">
                        Publish your first thought and it will appear here.
                      </p>

                    </div>

                  )}

                </div>

              ) : (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    <BookOpen size={25} />
                  </div>

                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-slate-800">
                    {activeTab}
                  </h3>

                  <p className="mt-2 text-[14px] font-normal text-slate-500">
                    This section will become dynamic when its backend feature is added.
                  </p>

                </div>

              )}

            </div>

          </section>

        </main>

        {/* ==========================================
            RIGHT SIDEBAR
        ========================================== */}

        <aside className="hidden h-screen w-[250px] shrink-0 overflow-hidden bg-[#f4f6fc] px-3 py-3 xl:block">

          <div className="flex h-full flex-col gap-3 overflow-hidden">

          

            {/* THOUGHTBOOK SAYS */}

            <div className="rounded-[20px] bg-white p-3 shadow-sm">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Feather size={15} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-600">
                      ThoughtBook Says
                    </p>
                    <p className="text-[11px] text-slate-400">
                      From the ThoughtBook team
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchThoughtbookSays}
                  disabled={isThoughtLoading}
                  aria-label="Refresh ThoughtBook Says"
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clock3 size={14} />
                </button>
              </div>

              <div className="mt-3 rounded-2xl bg-linear-to-br from-indigo-50 via-violet-50 to-sky-50 p-4">
                {isThoughtLoading ? (
                  <div className="space-y-2" aria-live="polite">
                    <div className="h-3 w-4/5 animate-pulse rounded bg-white/80" />
                    <div className="h-3 w-full animate-pulse rounded bg-white/80" />
                    <div className="h-3 w-3/5 animate-pulse rounded bg-white/80" />
                  </div>
                ) : thoughtError ? (
                  <div>
                    <p className="text-[12px] leading-5 text-rose-600">
                      {thoughtError}
                    </p>
                    <button
                      type="button"
                      onClick={fetchThoughtbookSays}
                      className="mt-2 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Try again
                    </button>
                  </div>
                ) : thoughtbookSays ? (
                  <>
                    <p className="font-serif text-[16px] leading-7 tracking-[-0.01em] text-slate-800">
                      “{thoughtbookSays.admin_thought}”
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-indigo-100 pt-3">
                      <span className="text-[10px] font-medium text-slate-400">
                        Published {new Date(
                          thoughtbookSays.published_at
                        ).toLocaleDateString()}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="font-serif text-[15px] leading-6 text-slate-700">
                      No ThoughtBook Says is active right now.
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Check back later for the next thought from the ThoughtBook team.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* SUGGESTIONS */}

            <div className="rounded-[20px] bg-white p-3 shadow-sm">

              <div className="mb-2 flex items-center justify-between">

                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                  Suggested People
                </h3>

                <button
                  type="button"
                  className="text-[13px] font-semibold text-indigo-600"
                >
                  See all
                </button>

              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-[13px] font-normal leading-5 text-slate-500">
                New connections will appear here as your network grows.
              </div>

            </div>

            {/* TRENDING */}

            <div className="rounded-[20px] bg-white p-3 shadow-sm">

              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
                Trending Today
              </h3>

              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-[13px] font-normal leading-5 text-slate-500">
                Trending topics will appear here as your audience grows.
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default ProfilePage;

