import { useEffect, useState } from "react";
import {
  Bell,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:8000";

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD FOLLOW REQUESTS
  // ============================================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/thoughtbook/follow/requests`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("FOLLOW REQUEST STATUS:", response.status);
      console.log("FOLLOW REQUEST RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Unable to load follow requests."
        );
      }

      setRequests(data.requests || []);
    } catch (error) {
      console.error("Follow requests error:", error);

      setError(
        error.message || "Unable to load follow requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ============================================================
  // ACCEPT REQUEST
  // ============================================================

  const handleAccept = async (followId) => {
    try {
      setProcessingId(followId);
      setError("");

      const response = await fetch(
        `${API_URL}/thoughtbook/follow/requests/${followId}/accept`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("ACCEPT REQUEST:", response.status);
      console.log("ACCEPT RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Unable to accept follow request."
        );
      }

      // Remove the accepted request from the list.
      setRequests((current) =>
        current.filter(
          (request) => request.follow_id !== followId
        )
      );
    } catch (error) {
      console.error("Accept request error:", error);

      setError(
        error.message ||
          "Unable to accept follow request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // REJECT REQUEST
  // ============================================================

  const handleReject = async (followId) => {
    try {
      setProcessingId(followId);
      setError("");

      const response = await fetch(
        `${API_URL}/thoughtbook/follow/requests/${followId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      console.log("REJECT REQUEST:", response.status);
      console.log("REJECT RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Unable to reject follow request."
        );
      }

      // Remove the rejected request from the list.
      setRequests((current) =>
        current.filter(
          (request) => request.follow_id !== followId
        )
      );
    } catch (error) {
      console.error("Reject request error:", error);

      setError(
        error.message ||
          "Unable to reject follow request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // USER DETAILS
  // ============================================================

  const getRequesterName = (request) => {
    return (
      request.USER_NAME ||
      request.user_name ||
      request.follower_name ||
      request.name ||
      "ThoughtBook User"
    );
  };

  const getRequesterEmail = (request) => {
    return (
      request.USER_EMAIL_ID ||
      request.user_email ||
      request.follower_email ||
      ""
    );
  };

  const getRequesterPicture = (request) => {
    return (
      request.USER_PROFILE_PIC ||
      request.user_profile_pic ||
      request.follower_profile_pic ||
      null
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <main className="mx-auto max-w-[900px] px-6 py-8">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <Bell size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your follow requests and activity.
              </p>
            </div>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* FOLLOW REQUESTS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-semibold text-slate-900">
                  Follow Requests
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  People who want to follow you.
                </p>
              </div>

              {requests.length > 0 && (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {requests.length}
                </span>
              )}

            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex items-center justify-center px-5 py-12 text-sm text-slate-500">

              <Loader2
                size={20}
                className="mr-2 animate-spin text-indigo-500"
              />

              Loading follow requests...
            </div>
          )}

          {/* EMPTY */}
          {!loading && requests.length === 0 && (
            <div className="px-5 py-14 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Bell
                  size={25}
                  className="text-slate-300"
                />
              </div>

              <h3 className="font-semibold text-slate-800">
                No follow requests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New follow requests will appear here.
              </p>

            </div>
          )}

          {/* REQUESTS */}
          {!loading && requests.length > 0 && (
            <div>

              {requests.map((request) => {
                const name = getRequesterName(request);
                const email = getRequesterEmail(request);
                const picture = getRequesterPicture(request);
                const initial =
                  name.charAt(0).toUpperCase();

                const followId = request.follow_id;

                const isProcessing =
                  processingId === followId;

                return (
                  <div
                    key={followId}
                    className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                  >

                    {/* PROFILE IMAGE */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50">

                      {picture ? (
                        <img
                          src={picture}
                          alt={`${name}'s profile`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.onerror =
                              null;
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span className="font-semibold text-indigo-600">
                          {initial}
                        </span>
                      )}

                    </div>

                    {/* USER INFORMATION */}
                    <div className="min-w-0 flex-1">

                      <p className="truncate font-semibold text-slate-900">
                        {name}
                      </p>

                      {email && (
                        <p className="truncate text-sm text-slate-500">
                          {email}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-400">
                        Wants to follow you
                      </p>

                    </div>

                    {/* ACTIONS */}
                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleAccept(followId)
                        }
                        className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {isProcessing ? (
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <UserCheck size={15} />
                        )}

                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleReject(followId)
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <UserX size={15} />
                        Reject
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}