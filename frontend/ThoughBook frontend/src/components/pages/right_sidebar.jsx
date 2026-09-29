import { useEffect, useState } from "react";
import { Feather, Clock3 } from "lucide-react";

const API_URL = "http://localhost:8000";

const RightSidebar = ({ heightClass = "h-screen" }) => {
  const [thoughtbookSays, setThoughtbookSays] = useState(null);
  const [isThoughtLoading, setIsThoughtLoading] = useState(true);
  const [thoughtError, setThoughtError] = useState("");

  const fetchThoughtbookSays = async () => {
    setIsThoughtLoading(true);
    setThoughtError("");

    try {
      const response = await fetch(`${API_URL}/thoughtbook-says/current`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load ThoughtBook Says.");
      }

      setThoughtbookSays(data.thought || null);
    } catch (error) {
      console.error("Failed to load ThoughtBook Says:", error);
      setThoughtError(error.message || "Unable to load ThoughtBook Says.");
    } finally {
      setIsThoughtLoading(false);
    }
  };

  useEffect(() => {
    fetchThoughtbookSays();

    const intervalId = window.setInterval(fetchThoughtbookSays, 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
<aside className={`hidden ${heightClass} w-[250px] shrink-0 overflow-hidden bg-[#f4f6fc] px-3 py-3 xl:block`}>

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
  );
};

export default RightSidebar;