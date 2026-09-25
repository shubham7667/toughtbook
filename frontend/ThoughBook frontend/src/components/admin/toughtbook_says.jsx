import { useState, useEffect } from "react";
import {
  BadgeCheck,
  Sparkles,
  Clock,
  Trash2,
  Edit3,
  PlusCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

const MAX_CHARS = 500;
const API_BASE_URL = "http://localhost:8000";

export default function ThoughtbookSays() {
  // --------------------------------------------------
  // THOUGHT STATES
  // --------------------------------------------------

  const [draft, setDraft] = useState("");

  const [currentThought, setCurrentThought] = useState(null);
  const [history, setHistory] = useState([]);

  // --------------------------------------------------
  // EDIT STATES
  // --------------------------------------------------

  const [editingCurrent, setEditingCurrent] = useState(false);
  const [editDraft, setEditDraft] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // --------------------------------------------------
  // UI STATES
  // --------------------------------------------------

  const [published, setPublished] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // ADMIN PROFILE
  // --------------------------------------------------

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    picture: "",
  });

  // ==================================================
  // FETCH ADMIN DETAILS
  // ==================================================

  const fetchAdmin = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/me`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admin details.");
      }

      const data = await response.json();

      setAdmin({
        name: data.name || "Admin",
        email: data.email || "",
        picture: data.picture || "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // FETCH CURRENT THOUGHT
  // ==================================================

  const fetchCurrentThought = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/current`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch current thought.");
      }

      const data = await response.json();

      setCurrentThought(data.thought);

      if (data.thought) {
        setEditDraft(data.thought.admin_thought);
      } else {
        setEditDraft("");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // FETCH HISTORY
  // ==================================================

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/all`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch thought history.");
      }

      const data = await response.json();

      setHistory(data.thoughts || []);
    } catch (error) {
      setError(error.message);
    }
  };

  // ==================================================
  // INITIAL PAGE LOAD
  // ==================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          fetchAdmin(),
          fetchCurrentThought(),
          fetchHistory(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==================================================
  // PUBLISH THOUGHT
  // ==================================================

  const handlePublish = async () => {
    if (!draft.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thought: draft.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to publish thought.");
      }

      await response.json();

      await fetchCurrentThought();
      await fetchHistory();

      setPublished(true);
      setDraft("");

      setTimeout(() => {
        setPublished(false);
      }, 1800);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // REMOVE CURRENT THOUGHT
  // ==================================================

  const handleRemoveCurrent = async () => {
    if (!currentThought) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/delete/${currentThought.thought_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove current thought.");
      }

      setCurrentThought(null);
      setEditingCurrent(false);
      setEditDraft("");

      await fetchHistory();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DELETE HISTORY THOUGHT
  // ==================================================

  const handleDeleteHistory = async (thought_id) => {
    try {
      setDeletingId(thought_id);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/delete/${thought_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete thought.");
      }

      setHistory((previousHistory) =>
        previousHistory.filter(
          (thought) => thought.thought_id !== thought_id
        )
      );

      // If deleted thought was current thought
      if (
        currentThought &&
        currentThought.thought_id === thought_id
      ) {
        setCurrentThought(null);
        setEditDraft("");
        setEditingCurrent(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ==================================================
  // START HISTORY EDIT
  // ==================================================

  const startEditHistory = (thought) => {
    setEditingId(thought.thought_id);
    setEditText(thought.admin_thought);
  };

  // ==================================================
  // SAVE HISTORY EDIT
  // ==================================================

  const saveEditHistory = async () => {
    if (!editText.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/update/${editingId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thought: editText.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update thought.");
      }

      setHistory((previousHistory) =>
        previousHistory.map((thought) =>
          thought.thought_id === editingId
            ? {
                ...thought,
                admin_thought: editText.trim(),
              }
            : thought
        )
      );

      // If this is also the current thought
      if (
        currentThought &&
        currentThought.thought_id === editingId
      ) {
        setCurrentThought({
          ...currentThought,
          admin_thought: editText.trim(),
        });

        setEditDraft(editText.trim());
      }

      setEditingId(null);
      setEditText("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // START CURRENT THOUGHT EDIT
  // ==================================================

  const startEditCurrent = () => {
    if (!currentThought) return;

    setEditDraft(currentThought.admin_thought);
    setEditingCurrent(true);
  };

  // ==================================================
  // SAVE CURRENT THOUGHT EDIT
  // ==================================================

  const saveCurrentEdit = async () => {
    if (!currentThought || !editDraft.trim()) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/admin/thoughtbook-says/update/${currentThought.thought_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thought: editDraft.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update thought.");
      }

      const updatedText = editDraft.trim();

      setCurrentThought({
        ...currentThought,
        admin_thought: updatedText,
      });

      setHistory((previousHistory) =>
        previousHistory.map((thought) =>
          thought.thought_id === currentThought.thought_id
            ? {
                ...thought,
                admin_thought: updatedText,
              }
            : thought
        )
      );

      setEditingCurrent(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <div className="flex items-center gap-2 mb-0.5">

            <h1
              className="font-serif text-2xl"
              style={{ color: "var(--foreground)" }}
            >
              Admin Dashboard
            </h1>

            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
              style={{
                background: "rgba(79,70,229,0.1)",
                color: "var(--primary)",
              }}
            >
              admin
            </span>

          </div>

          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Manage ThoughtBook Says and community content
          </p>
        </div>

        {/* ADMIN PROFILE */}

        <div className="flex items-center gap-2">

          <div className="story-ring shrink-0">
            <div className="story-ring-inner">

              {admin.picture ? (
                <img
                  src={admin.picture}
                  alt={admin.name || "Admin"}
                  className="w-9 h-9 rounded-full object-cover block"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold"
                  style={{
                    background: "rgba(79,70,229,0.1)",
                    color: "var(--primary)",
                  }}
                >
                  {admin.name
                    ? admin.name.charAt(0).toUpperCase()
                    : "A"}
                </div>
              )}

            </div>
          </div>

          <div className="hidden sm:block">

            <p
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {admin.name || "Admin"}
            </p>

            <p
              className="text-xs"
              style={{ color: "var(--primary)" }}
            >
              {admin.email}
            </p>

          </div>

        </div>

      </div>

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================
          TWO COLUMN LAYOUT
      ================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ==================================================
            LEFT COLUMN
        ================================================== */}

        <div className="lg:col-span-2 space-y-5">

          {/* ==================================================
              THOUGHT EDITOR
          ================================================== */}

          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >

            <div className="flex items-center gap-2 mb-1">

              <Sparkles
                size={16}
                style={{ color: "var(--primary)" }}
              />

              <h2
                className="font-serif text-lg"
                style={{ color: "var(--foreground)" }}
              >
                ThoughtBook Says
              </h2>

            </div>

            <p
              className="text-sm mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              Share a thought with everyone on ThoughtBook.
            </p>

            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Today's Thought
            </label>

            <textarea
              value={draft}
              onChange={(e) =>
                setDraft(e.target.value.slice(0, MAX_CHARS))
              }
              rows={5}
              placeholder="Write something meaningful for the ThoughtBook community..."
              className="field-input resize-none mb-2"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "15px",
                lineHeight: "1.7",
              }}
            />

            {/* CHARACTER COUNTER */}

            <div className="flex items-center justify-between mb-4">

              <div
                className="flex-1 h-1 rounded-full overflow-hidden mr-3"
                style={{ background: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${(draft.length / MAX_CHARS) * 100}%`,
                    background:
                      draft.length > MAX_CHARS * 0.9
                        ? "#ef4444"
                        : "var(--primary)",
                  }}
                />
              </div>

              <span
                className="text-xs font-mono shrink-0"
                style={{
                  color:
                    draft.length > MAX_CHARS * 0.9
                      ? "#ef4444"
                      : "var(--muted-foreground)",
                }}
              >
                {draft.length} / {MAX_CHARS}
              </span>

            </div>

            {/* PUBLISH */}

            <button
              onClick={handlePublish}
              disabled={!draft.trim() || loading}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40"
              style={
                published
                  ? {
                      background: "#10b981",
                      color: "#fff",
                    }
                  : {
                      background:
                        "linear-gradient(135deg,#4f46e5,#818cf8)",
                      color: "#fff",
                    }
              }
            >
              {loading ? (
                <>Publishing...</>
              ) : published ? (
                <>
                  <CheckCircle size={15} />
                  Published!
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Publish Thought
                </>
              )}
            </button>

          </div>

          {/* ==================================================
              CURRENT THOUGHT
          ================================================== */}

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >

            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "rgba(79,70,229,0.04)",
              }}
            >

              <div className="flex items-center gap-2">

                <BadgeCheck
                  size={15}
                  style={{ color: "var(--primary)" }}
                />

                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--primary)" }}
                >
                  Current Thought
                </span>

              </div>

              {currentThought && (
                <span
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.1)",
                    color: "#10b981",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Live
                </span>
              )}

            </div>

            <div className="p-5">

              {currentThought ? (

                editingCurrent ? (

                  <div className="space-y-3">

                    <textarea
                      value={editDraft}
                      onChange={(e) =>
                        setEditDraft(
                          e.target.value.slice(0, MAX_CHARS)
                        )
                      }
                      rows={3}
                      className="field-input resize-none"
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: "15px",
                      }}
                    />

                    <div className="flex gap-2">

                      <button
                        onClick={saveCurrentEdit}
                        disabled={loading || !editDraft.trim()}
                        className="text-sm px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-40"
                        style={{
                          background:
                            "linear-gradient(135deg,#4f46e5,#818cf8)",
                          color: "#fff",
                        }}
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditDraft(
                            currentThought.admin_thought
                          );
                          setEditingCurrent(false);
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--muted-foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <XCircle size={12} />
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>
                    <div
                      className="mb-4 px-4 py-3 rounded-xl"
                      style={{
                        background: "var(--muted)",
                        borderLeft:
                          "3px solid var(--primary)",
                      }}
                    >

                      <p
                        className="font-serif text-base italic leading-relaxed"
                        style={{
                          color: "var(--foreground)",
                          fontFamily:
                            "'DM Serif Display', serif",
                        }}
                      >
                        "{currentThought.admin_thought}"
                      </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4">

                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                      >
                        <BadgeCheck
                          size={12}
                          style={{
                            color: "var(--primary)",
                          }}
                        />

                        Published:{" "}
                        {new Date(
                          currentThought.published_at
                        ).toLocaleString()}
                      </span>

                      <span
                        className="flex items-center gap-1.5 text-xs"
                        style={{
                          color:
                            "var(--muted-foreground)",
                        }}
                      >
                        <Clock
                          size={12}
                          style={{ color: "#f59e0b" }}
                        />

                        Expires:{" "}
                        {new Date(
                          currentThought.expires_at
                        ).toLocaleString()}
                      </span>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={startEditCurrent}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background:
                            "rgba(79,70,229,0.1)",
                          color: "var(--primary)",
                          border:
                            "1px solid rgba(79,70,229,0.2)",
                        }}
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>

                      <button
                        onClick={handleRemoveCurrent}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                        style={{
                          background:
                            "rgba(239,68,68,0.08)",
                          color: "#ef4444",
                          border:
                            "1px solid rgba(239,68,68,0.2)",
                        }}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>

                    </div>
                  </>

                )

              ) : (

                /* EMPTY STATE */

                <div className="text-center py-8">

                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: "var(--secondary)",
                    }}
                  >
                    <Sparkles
                      size={20}
                      style={{
                        color:
                          "var(--muted-foreground)",
                      }}
                    />
                  </div>

                  <p
                    className="font-serif text-base mb-1"
                    style={{
                      color: "var(--foreground)",
                    }}
                  >
                    ThoughtBook Says
                  </p>

                  <p
                    className="text-sm mb-1"
                    style={{
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    No thought for today.
                  </p>

                  <p
                    className="text-xs mb-4"
                    style={{
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    Write something and share it with the ThoughtBook community.
                  </p>

                  <button
                    onClick={() => {
                      document
                        .querySelector("textarea")
                        ?.focus();
                    }}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl mx-auto transition-all"
                    style={{
                      background:
                        "rgba(79,70,229,0.1)",
                      color: "var(--primary)",
                      border:
                        "1px solid rgba(79,70,229,0.2)",
                    }}
                  >
                    <PlusCircle size={14} />
                    Write Today's Thought
                  </button>

                </div>

              )}

            </div>

          </div>

          {/* ==================================================
              HISTORY
          ================================================== */}

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >

            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderBottom: "1px solid var(--border)",
              }}
            >

              <div className="flex items-center gap-2">

                <RotateCcw
                  size={14}
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                />

                <h3
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  Previous Thoughts
                </h3>

              </div>

              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: "var(--secondary)",
                  color:
                    "var(--muted-foreground)",
                }}
              >
                {history.length} entries
              </span>

            </div>

            <div
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >

              {history.length === 0 ? (

                <div className="text-center py-8">

                  <p
                    className="text-sm"
                    style={{
                      color:
                        "var(--muted-foreground)",
                    }}
                  >
                    No previous thoughts.
                  </p>

                </div>

              ) : (

                history.map((thought) => {

                  const isExpired =
                    new Date(thought.expires_at) <=
                    new Date();

                  return (
                    <div
                      key={thought.thought_id}
                      className="px-5 py-4 transition-all"
                      style={{
                        opacity:
                          deletingId ===
                          thought.thought_id
                            ? 0
                            : 1,
                        transition:
                          "opacity 0.3s",
                      }}
                    >

                      {editingId ===
                      thought.thought_id ? (

                        <div className="space-y-2">

                          <textarea
                            value={editText}
                            onChange={(e) =>
                              setEditText(
                                e.target.value.slice(
                                  0,
                                  MAX_CHARS
                                )
                              )
                            }
                            rows={2}
                            className="field-input resize-none text-sm"
                          />

                          <div className="flex gap-2">

                            <button
                              onClick={
                                saveEditHistory
                              }
                              disabled={
                                loading ||
                                !editText.trim()
                              }
                              className="text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40"
                              style={{
                                background:
                                  "linear-gradient(135deg,#4f46e5,#818cf8)",
                                color: "#fff",
                              }}
                            >
                              Save
                            </button>

                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditText("");
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium"
                              style={{
                                background:
                                  "var(--secondary)",
                                color:
                                  "var(--muted-foreground)",
                                border:
                                  "1px solid var(--border)",
                              }}
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex-1 min-w-0">

                            <p
                              className="text-sm leading-relaxed mb-2 font-serif italic"
                              style={{
                                color:
                                  "var(--foreground)",
                                fontFamily:
                                  "'DM Serif Display', serif",
                              }}
                            >
                              "{thought.admin_thought}"
                            </p>

                            <div className="flex flex-wrap items-center gap-3">

                              <span
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--muted-foreground)",
                                }}
                              >
                                Published:{" "}
                                {new Date(
                                  thought.published_at
                                ).toLocaleString()}
                              </span>

                              <span
                                className="text-xs"
                                style={{
                                  color:
                                    "var(--muted-foreground)",
                                }}
                              >
                                Expires:{" "}
                                {new Date(
                                  thought.expires_at
                                ).toLocaleString()}
                              </span>

                              <span
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={
                                  !isExpired
                                    ? {
                                        background:
                                          "rgba(16,185,129,0.1)",
                                        color:
                                          "#10b981",
                                      }
                                    : {
                                        background:
                                          "var(--secondary)",
                                        color:
                                          "var(--muted-foreground)",
                                      }
                                }
                              >
                                {!isExpired ? (
                                  <>
                                    <CheckCircle
                                      size={10}
                                    />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle
                                      size={10}
                                    />
                                    Expired
                                  </>
                                )}
                              </span>

                            </div>

                          </div>

                          <div className="flex items-center gap-1 shrink-0">

                            <button
                              onClick={() =>
                                startEditHistory(
                                  thought
                                )
                              }
                              className="p-1.5 rounded-lg transition-all hover:opacity-70"
                              style={{
                                color:
                                  "var(--primary)",
                              }}
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteHistory(
                                  thought.thought_id
                                )
                              }
                              disabled={loading}
                              className="p-1.5 rounded-lg transition-all hover:opacity-70 disabled:opacity-40"
                              style={{
                                color: "#ef4444",
                              }}
                            >
                              <Trash2 size={13} />
                            </button>

                          </div>

                        </div>

                      )}

                    </div>
                  );
                })

              )}

            </div>

          </div>

        </div>

        {/* ==================================================
            RIGHT SIDEBAR
        ================================================== */}

        <div className="space-y-4">

          {/* STATUS */}

          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >

            <div className="flex items-center gap-2 mb-3">

              <Sparkles
                size={14}
                style={{ color: "var(--primary)" }}
              />

              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{
                  color:
                    "var(--muted-foreground)",
                }}
              >
                ThoughtBook Says
              </span>

            </div>

            {[
              {
                label: "Status",
                value: currentThought
                  ? "Active"
                  : "Inactive",
                color: currentThought
                  ? "#10b981"
                  : "var(--muted-foreground)",
                dot: true,
              },
              {
                label: "Expires",
                value: currentThought
                  ? new Date(
                      currentThought.expires_at
                    ).toLocaleString()
                  : "—",
                color: "#f59e0b",
              },
              {
                label: "Total Thoughts",
                value: String(history.length),
                color: "var(--foreground)",
              },
            ].map((item) => (

              <div
                key={item.label}
                className="flex items-center justify-between py-2.5"
                style={{
                  borderBottom:
                    "1px solid var(--border)",
                }}
              >

                <span
                  className="text-xs"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >
                  {item.label}
                </span>

                <span
                  className="flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: item.color }}
                >
                  {item.dot && (
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{
                        background: item.color,
                      }}
                    />
                  )}

                  {item.value}
                </span>

              </div>

            ))}

          </div>

          {/* WRITING TIPS */}

          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >

            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{
                color:
                  "var(--muted-foreground)",
              }}
            >
              Writing Tips
            </p>

            <ul className="space-y-2.5">

              {[
                "Keep thoughts under 2–3 sentences for best engagement.",
                "Post before 9 AM to reach morning readers.",
                "Use questions to spark reflection in your community.",
              ].map((tip, index) => (

                <li
                  key={index}
                  className="flex items-start gap-2 text-xs leading-relaxed"
                  style={{
                    color:
                      "var(--muted-foreground)",
                  }}
                >

                  <span
                    className="mt-0.5 shrink-0 font-mono"
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    ✦
                  </span>

                  {tip}

                </li>

              ))}

            </ul>
            

          </div>

        </div>

      </div>

    </div>
  );
}