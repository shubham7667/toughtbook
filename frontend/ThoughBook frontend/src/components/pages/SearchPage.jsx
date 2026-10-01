import { useEffect, useRef, useState } from "react";
import {
  Search,
  UserPlus,
  Loader2,
  X,
  UserCheck,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [followStatus, setFollowStatus] = useState("follow");
  const [followLoading, setFollowLoading] = useState(false);

  const searchRef = useRef(null);

  // ============================================================
  // LIVE SEARCH
  // ============================================================

  useEffect(() => {
    const searchText = query.trim();

    if (!searchText) {
      setUsers([]);
      setError("");
      setLoading(false);
      setShowDropdown(false);
      return;
    }

    if (selectedUser) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        setShowDropdown(true);

        const response = await fetch(
          `${API_URL}/thoughtbook/search/users?q=${encodeURIComponent(
            searchText
          )}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        console.log("SEARCH STATUS:", response.status);
        console.log("SEARCH RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.message ||
              `Search failed (${response.status})`
          );
        }

        setUsers(data.users || []);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Search error:", error);

        setUsers([]);
        setError(error.message || "Unable to search users.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, selectedUser]);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // CHECK FOLLOW STATUS
  // ============================================================

  const checkFollowStatus = async (userId) => {
    try {
      const response = await fetch(
        `${API_URL}/thoughtbook/follow/status/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("FOLLOW STATUS:", response.status);
      console.log("FOLLOW STATUS RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Unable to check follow status."
        );
      }

      setFollowStatus(data.status || "follow");
    } catch (error) {
      console.error("Follow status error:", error);
      setFollowStatus("follow");
    }
  };

  // ============================================================
  // SELECT USER
  // ============================================================

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setQuery(user.USER_NAME || "");
    setShowDropdown(false);
    setError("");

    setFollowStatus("follow");

    await checkFollowStatus(user.USER_ID);
  };

  // ============================================================
  // FOLLOW USER
  // ============================================================

  const handleFollow = async () => {
    if (!selectedUser || followLoading) {
      return;
    }

    try {
      setFollowLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/thoughtbook/follow/${selectedUser.USER_ID}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("FOLLOW STATUS:", response.status);
      console.log("FOLLOW RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Unable to follow this user."
        );
      }

      setFollowStatus(data.status || "follow");
    } catch (error) {
      console.error("Follow error:", error);
      setError(
        error.message || "Unable to follow this user."
      );
    } finally {
      setFollowLoading(false);
    }
  };

  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  const handleClearSearch = () => {
    setQuery("");
    setUsers([]);
    setError("");
    setSelectedUser(null);
    setFollowStatus("follow");
    setShowDropdown(false);
  };

  // ============================================================
  // SEARCH SUBMIT
  // ============================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    setShowDropdown(false);
  };

  // ============================================================
  // FOLLOW BUTTON
  // ============================================================

  const renderFollowButton = () => {
    if (followLoading) {
      return (
        <button
          type="button"
          disabled
          className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
        >
          <Loader2
            size={16}
            className="animate-spin"
          />
          Processing...
        </button>
      );
    }

    if (followStatus === "following") {
      return (
        <button
          type="button"
          disabled
          className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600"
        >
          <UserCheck size={16} />
          Following
        </button>
      );
    }

    if (followStatus === "requested") {
      return (
        <button
          type="button"
          disabled
          className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600"
        >
          <Clock size={16} />
          Requested
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleFollow}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        <UserPlus size={16} />
        Follow
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <main className="mx-auto max-w-[900px] px-6 py-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Search People
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Find people on ThoughtBook and connect with them.
          </p>
        </div>

        {/* SEARCH AREA */}
        <div
          ref={searchRef}
          className="relative"
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">

              <Search
                size={20}
                className="mr-3 shrink-0 text-slate-400"
              />

              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedUser(null);
                  setFollowStatus("follow");
                  setError("");

                  if (event.target.value.trim()) {
                    setShowDropdown(true);
                  } else {
                    setShowDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (query.trim()) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="Search people by name or email..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              {loading && (
                <Loader2
                  size={18}
                  className="mr-3 animate-spin text-indigo-500"
                />
              )}

              {query && !loading && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mr-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}

              <button
                type="submit"
                disabled={!query.trim()}
                className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Search
              </button>

            </div>
          </form>

          {/* AUTOCOMPLETE DROPDOWN */}
          {showDropdown && query.trim() && (
            <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

              {loading && (
                <div className="flex items-center gap-3 px-5 py-4 text-sm text-slate-500">
                  <Loader2
                    size={18}
                    className="animate-spin text-indigo-500"
                  />
                  Searching people...
                </div>
              )}

              {!loading && error && (
                <div className="px-5 py-4 text-sm text-red-500">
                  {error}
                </div>
              )}

              {!loading &&
                !error &&
                users.length > 0 && (
                  <div className="max-h-[360px] overflow-y-auto">

                    {users.map((user) => {
                      const displayName =
                        user.USER_NAME ||
                        "ThoughtBook User";

                      const initial =
                        displayName
                          .charAt(0)
                          .toUpperCase();

                      return (
                        <button
                          key={user.USER_ID}
                          type="button"
                          onClick={() =>
                            handleSelectUser(user)
                          }
                          className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                        >

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50">

                            {user.USER_PROFILE_PIC ? (
                              <img
                                src={user.USER_PROFILE_PIC}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-indigo-600">
                                {initial}
                              </span>
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {displayName}
                            </p>

                            {user.USER_EMAIL_ID && (
                              <p className="truncate text-xs text-slate-500">
                                {user.USER_EMAIL_ID}
                              </p>
                            )}

                          </div>

                        </button>
                      );
                    })}

                  </div>
                )}

              {!loading &&
                !error &&
                query.trim() &&
                users.length === 0 && (
                  <div className="px-5 py-5 text-center">

                    <Search
                      size={24}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try another name or email.
                    </p>

                  </div>
                )}

            </div>
          )}
        </div>

        {/* SELECTED USER */}
        {selectedUser && (
          <section className="mt-6">

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="flex items-center gap-4 px-5 py-4">

                {/* PROFILE IMAGE */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50">

                  {selectedUser.USER_PROFILE_PIC ? (
                    <img
                      src={selectedUser.USER_PROFILE_PIC}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-indigo-600">
                      {(
                        selectedUser.USER_NAME ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                </div>

                {/* USER INFO */}
                <div className="min-w-0 flex-1">

                  <p className="truncate font-semibold text-slate-900">
                    {selectedUser.USER_NAME ||
                      "ThoughtBook User"}
                  </p>

                  {selectedUser.USER_EMAIL_ID && (
                    <p className="truncate text-sm text-slate-500">
                      {selectedUser.USER_EMAIL_ID}
                    </p>
                  )}

                </div>

                {/* FOLLOW */}
                {renderFollowButton()}

              </div>

              {/* ERROR */}
              {error && (
                <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

            </div>

          </section>
        )}

      </main>
    </div>
  );
}