import React from "react";
import {
  LockKeyhole,
  Home,
  ArrowLeft,
  ShieldAlert,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const AdminUnauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAdminLogin = () => {
    window.location.href = `${API_URL}/thoughtbook/login/google`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="h-[88px] border-b border-slate-100 bg-white">

        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 lg:px-10">

          {/* LOGO */}

          <button
            type="button"
            onClick={handleGoHome}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center">

              <svg
                viewBox="0 0 48 48"
                className="h-10 w-10"
                fill="none"
              >
                <path
                  d="M9 39C15 27 21 16 38 8C35 19 27 32 9 39Z"
                  fill="#4F8EF7"
                />

                <path
                  d="M11 35C17 29 23 24 31 20"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                <path
                  d="M17 29L14 23"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                <path
                  d="M23 24L21 17"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

              </svg>

            </div>

            <span
              className="font-serif text-[30px] font-bold tracking-[-0.04em]"
              style={{
                color: "#142B4A",
              }}
            >
              ThoughtBook
            </span>
          </button>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-8 md:flex">

            <button
              onClick={handleGoHome}
              className="text-[15px] font-medium text-slate-700 transition hover:text-indigo-600"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/explore")}
              className="text-[15px] font-medium text-slate-700 transition hover:text-indigo-600"
            >
              Explore
            </button>

            <button
              onClick={() => navigate("/about")}
              className="text-[15px] font-medium text-slate-700 transition hover:text-indigo-600"
            >
              About
            </button>

            <button
              onClick={handleAdminLogin}
              className="rounded-xl bg-[#142F55] px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#0f2442]"
            >
              Sign In
            </button>

          </nav>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="min-h-[calc(100vh-88px)]">

        <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-[1400px] grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:px-10">

          {/* =================================================
              LEFT ILLUSTRATION
          ================================================= */}

          <div className="relative hidden h-[650px] overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-50 via-white to-blue-50 lg:block">

            {/* Decorative blobs */}

            <div className="absolute left-[-80px] top-[-80px] h-[250px] w-[250px] rounded-full bg-indigo-100/60 blur-3xl" />

            <div className="absolute bottom-[-100px] left-[100px] h-[300px] w-[300px] rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute right-[-80px] top-[100px] h-[220px] w-[220px] rounded-full bg-purple-100/50 blur-3xl" />


            {/* ADMIN ONLY DOOR */}

            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">

              {/* Door */}

              <div className="relative h-[430px] w-[270px] rounded-t-[35px] border-[10px] border-slate-300 bg-gradient-to-b from-slate-800 to-slate-950 shadow-2xl">

                {/* Door light */}

                <div className="absolute left-1/2 top-8 h-16 w-16 -translate-x-1/2 rounded-full bg-yellow-300/10 blur-xl" />

                {/* Door content */}

                <div className="absolute left-1/2 top-[115px] w-[190px] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-6 text-center shadow-inner">

                  <div className="mb-3 text-4xl">
                    👑
                  </div>

                  <p className="text-xl font-bold tracking-wider text-white">
                    ADMIN
                  </p>

                  <p className="text-xl font-bold tracking-wider text-white">
                    ONLY
                  </p>

                  <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                    <ShieldAlert size={27} />
                  </div>

                </div>

                {/* Door knob */}

                <div className="absolute right-7 top-1/2 h-5 w-5 rounded-full border-2 border-yellow-500 bg-yellow-400 shadow-lg" />

              </div>


              {/* Rope barrier */}

              <div className="absolute -bottom-8 left-[-95px] right-[-95px] flex items-end justify-between">

                <div className="h-24 w-5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-lg" />

                <div className="mb-8 h-2 flex-1 bg-red-500" />

                <div className="h-24 w-5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-lg" />

              </div>

            </div>


            {/* QUESTION MARK */}

            <div className="absolute left-[12%] top-[36%] text-6xl font-bold text-indigo-400/70">
              ?
            </div>

            <div className="absolute left-[17%] top-[29%] text-3xl font-bold text-indigo-300/50">
              ?
            </div>


            {/* SMALL BOOKS */}

            <div className="absolute bottom-12 left-[8%] flex flex-col gap-1">

              <div className="h-5 w-36 rounded-md bg-indigo-300 shadow-sm" />

              <div className="h-5 w-40 rounded-md bg-blue-300 shadow-sm" />

              <div className="h-5 w-32 rounded-md bg-purple-300 shadow-sm" />

            </div>


            {/* FLOWERS */}

            <div className="absolute bottom-12 right-[8%] text-4xl">
              🌿
            </div>

            <div className="absolute left-[8%] top-16 text-3xl">
              🌿
            </div>

          </div>


          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div className="flex flex-col justify-center px-2 py-8 lg:px-12">

            {/* LOCK ICON */}

            <div className="mb-6 flex justify-center">

              <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-red-50">

                <LockKeyhole
                  size={43}
                  strokeWidth={2.3}
                  className="text-red-500"
                />

                {/* Decorative lines */}

                <span className="absolute -left-7 top-1/2 h-1 w-5 -translate-y-1/2 rounded-full bg-red-300" />

                <span className="absolute -right-7 top-1/2 h-1 w-5 -translate-y-1/2 rounded-full bg-red-300" />

                <span className="absolute left-1/2 -top-5 h-1 w-5 -translate-x-1/2 rotate-45 rounded-full bg-red-300" />

                <span className="absolute left-1/2 -bottom-5 h-1 w-5 -translate-x-1/2 -rotate-45 rounded-full bg-red-300" />

              </div>

            </div>


            {/* HEADING */}

            <div className="text-center">

              <h1
                className="font-serif text-4xl font-bold leading-tight tracking-[-0.035em] sm:text-5xl"
                style={{
                  color: "#142B4A",
                }}
              >
                Admin Access{" "}
                <span className="text-red-500">
                  Restricted
                </span>
              </h1>

              <p className="mt-4 text-xl font-medium text-slate-500">
                Oops! You don't have permission to access this page.
              </p>

              <p className="mx-auto mt-5 max-w-xl text-[16px] leading-7 text-slate-500">
                This area is only available to authorized
                administrators of ThoughtBook. If you believe
                this is a mistake, please contact the site owner.
              </p>

            </div>


            {/* ACTION BUTTONS */}

            <div className="mx-auto mt-8 w-full max-w-[590px] space-y-3">

              {/* HOME */}

              <button
                type="button"
                onClick={handleGoHome}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#14345D] px-6 py-4 text-[16px] font-semibold text-white shadow-sm transition hover:bg-[#102a4c]"
              >
                <Home size={20} />
                Go to Homepage
              </button>


              {/* BACK */}

              <button
                type="button"
                onClick={handleGoBack}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-[16px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={20} />
                Back to Previous Page
              </button>

            </div>


            {/* DIVIDER */}

            <div className="mx-auto my-7 flex w-full max-w-[590px] items-center gap-5">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-sm text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>


            {/* ADMIN LOGIN CARD */}

            <div className="mx-auto flex w-full max-w-[590px] flex-col gap-5 rounded-[24px] border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ShieldAlert size={26} />
                </div>

                <div>

                  <h3 className="text-[15px] font-semibold text-slate-900">
                    Authorized administrator?
                  </h3>

                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Sign in with your authorized Google account
                    to continue.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={handleAdminLogin}
                className="flex shrink-0 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[14px] font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >

                {/* GOOGLE ICON */}

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.5Z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.6a5.86 5.86 0 0 1 0-3.2V7.88H3.29a9.5 9.5 0 0 0 0 8.24l3.25-2.52Z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.37c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.45 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.71 5.38l3.25 2.52C7.31 8.09 9.46 6.37 12 6.37Z"
                  />
                </svg>

                Sign in with Google

              </button>

            </div>


            {/* FOOTER */}

            <p className="mt-8 text-center text-[13px] text-slate-400">
              ThoughtBook · Your thoughts, your story.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminUnauthorized;