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
  MessageCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

const LeftSidebar = ({ userName, userHandle, profilePicture, heightClass = "h-screen" }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const authUser = auth?.user?.user ?? auth?.user;
  const displayName = userName ?? authUser?.USER_NAME ?? "Thoughtful writer";
  const displayHandle = userHandle ?? (authUser?.USER_EMAIL_ID ? `@${authUser.USER_EMAIL_ID.split("@")[0]}` : "@yourhandle");
  const displayPicture = profilePicture ?? authUser?.USER_PROFILE_PIC;
  const userInitial = displayName.charAt(0).toUpperCase() || "U";
  return (
<aside className={`hidden ${heightClass} w-65 shrink-0 overflow-hidden border-r border-slate-200 bg-white px-3 py-3 lg:block`}>

          <div className="flex h-full flex-col overflow-hidden">

            {/* LOGO */}

           

      
            {/* NAVIGATION */}

            <nav className="mt-5 flex-1 space-y-1.5 overflow-hidden">

              {navItems.map(
                ({ label, icon: Icon }) => (

                  <button
  key={label}
  type="button"
  onClick={() => {
    if (label === "Search") {
      navigate("/search");
    }
  }}
  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[15px] tracking-[-0.01em] transition ${
    label === "Profile"
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
                    {/* CREATE POST */}

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:bg-indigo-600"
            >
              <PenSquare size={17} />
              Create Post
            </button>


            </nav>

            {/* USER */}

            <div className="mt-3 border-t border-slate-200 pt-3">

              <div className="flex items-center gap-3 rounded-2xl px-1 py-2">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-400 bg-indigo-50">

                  {displayPicture ? (
                      <img
                    src={displayPicture}
                    alt={`${displayName}'s profile`}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              displayName
                            )}&background=e0e7ff&color=4f46e5`;
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base font-semibold text-indigo-600">
                        {userInitial}
                      </div>
                    )}

                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-slate-900">
                    {displayName}
                  </p>

                  <p className="truncate text-[13px] font-normal text-slate-500">
                    {displayHandle}
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


  );
};

export default LeftSidebar;