import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Lock,
  User,
  Feather,
  MapPin,
  Link as LinkIcon,
  Languages as LanguagesIcon,
  Sparkles,
  Shield,
  TriangleAlert,
  Loader2,
  Camera,
  Globe,
} from "lucide-react";

const API_URL = "http://localhost:8000";

const BIO_LIMIT = 220;
const QUOTE_LIMIT = 150;

const languages = [
  "Urdu",
  "Hindi",
  "English",
  "Punjabi",
  "Persian",
];

const interests = [
  "Urdu Poetry",
  "Shayari",
  "Travel",
  "Photography",
  "Storytelling",
  "Hindi Literature",
  "Sufi Music",
  "Chai",
  "Nature",
  "Books",
  "Art",
  "Music",
  "Food",
  "Cricket",
  "Humor",
  "Fiction",
  "Cinema",
];

const sections = [
  { id: "basic", label: "Basic info", icon: User },
  { id: "bio", label: "Bio & quote", icon: Feather },
  { id: "links", label: "Location & links", icon: LinkIcon },
  { id: "languages", label: "Languages", icon: LanguagesIcon },
  { id: "interests", label: "Interests", icon: Sparkles },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "account", label: "Account", icon: TriangleAlert },
];

function EditProfile() {
  // -----------------------------
  // STATES
  // -----------------------------

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [notifyFollowers, setNotifyFollowers] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    quote: "",
    location: "",
    website: "",
    twitter: "",
    instagram: "",
    profile_pic: "",
    cover_pic: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Snapshot of the last saved state, used to detect unsaved changes.
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  const navigate = useNavigate();
  const toastTimer = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  // -----------------------------
  // FETCH PROFILE
  // -----------------------------

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Profile error:", data);
          showToast("error", data.detail || "Could not load your profile.");
          return;
        }

        // /profile returns identity data and user_profile data together.
        const user = data.user || data || {};
        const profile = data.profile || user || {};

        const getValue = (obj, ...keys) => {
          for (const key of keys) {
            if (obj && obj[key] !== undefined && obj[key] !== null) {
              return obj[key];
            }
          }
          return "";
        };

        // MySQL JSON columns may arrive as arrays or JSON strings.
        const parseJsonArray = (value) => {
          if (Array.isArray(value)) {
            return value;
          }

          if (typeof value === "string") {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }

          return [];
        };

        const savedLanguages = parseJsonArray(
          getValue(profile, "USER_LANGUAGES", "LANGUAGES", "languages")
        );
        const savedInterests = parseJsonArray(
          getValue(profile, "USER_INTERESTS", "INTERESTS", "interests")
        );

        const nextForm = {
          name: getValue(user, "USER_NAME", "user_name", "name") || "",
          profile_pic:
            getValue(user, "USER_PROFILE_PIC", "user_profile_pic", "profile_pic") || "",
          cover_pic:
            getValue(user, "USER_COVER_PIC", "user_cover_pic", "cover_pic") || "",
          email: getValue(user, "USER_EMAIL_ID", "user_email_id", "email") || "",
          bio: getValue(profile, "USER_BIO", "BIO", "bio") || "",
          quote: getValue(profile, "USER_QUOTE", "QUOTE", "quote") || "",
          location: getValue(profile, "USER_LOCATION", "LOCATION", "location") || "",
          website: getValue(profile, "USER_WEBSITE", "WEBSITE", "website") || "",
          twitter: getValue(profile, "USER_TWITTER", "TWITTER", "twitter") || "",
          instagram: getValue(profile, "USER_INSTAGRAM", "INSTAGRAM", "instagram") || "",
        };

        const rawPrivate = getValue(
          profile,
          "USER_PRIVATE_PROFILE",
          "PRIVATE_PROFILE",
          "private_profile"
        );
        const rawActivity = getValue(
          profile,
          "USER_SHOW_ACTIVITY",
          "SHOW_ACTIVITY",
          "show_activity"
        );
        const rawNotify = getValue(
          profile,
          "USER_NOTIFY_FOLLOWERS",
          "NOTIFY_FOLLOWERS",
          "notify_followers"
        );

        const nextPrivate = Boolean(rawPrivate);
        const nextActivity = rawActivity === "" ? true : Boolean(rawActivity);
        const nextNotify = rawNotify === "" ? true : Boolean(rawNotify);

        setFormData(nextForm);
        setSelectedLanguages(savedLanguages);
        setSelectedInterests(savedInterests);
        setPrivateProfile(nextPrivate);
        setShowActivity(nextActivity);
        setNotifyFollowers(nextNotify);

        setSavedSnapshot(
          buildSnapshot(
            nextForm,
            savedLanguages,
            savedInterests,
            nextPrivate,
            nextActivity,
            nextNotify
          )
        );
      } catch (error) {
        console.error("Error fetching profile:", error);
        showToast("error", "Could not reach the server. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // -----------------------------
  // SCROLL SPY FOR THE SIDE NAV
  // -----------------------------

  useEffect(() => {
    if (loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [loading]);

  // -----------------------------
  // HELPERS
  // -----------------------------

  function buildSnapshot(form, langs, ints, isPrivate, activity, notify) {
    return JSON.stringify({
      bio: form.bio,
      quote: form.quote,
      location: form.location,
      website: form.website,
      twitter: form.twitter,
      instagram: form.instagram,
      languages: [...langs].sort(),
      interests: [...ints].sort(),
      private_profile: isPrivate,
      show_activity: activity,
      notify_followers: notify,
    });
  }

  const currentSnapshot = useMemo(
    () =>
      buildSnapshot(
        formData,
        selectedLanguages,
        selectedInterests,
        privateProfile,
        showActivity,
        notifyFollowers
      ),
    [
      formData,
      selectedLanguages,
      selectedInterests,
      privateProfile,
      showActivity,
      notifyFollowers,
    ]
  );

  const isDirty =
    savedSnapshot !== null && currentSnapshot !== savedSnapshot;

  function showToast(type, message) {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ type, message });

    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleLanguage = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((item) => item !== language)
        : [...prev, language]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const jumpToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // -----------------------------
  // SAVE
  // -----------------------------

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/user_bio`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: formData.bio,
          quote: formData.quote,
          location: formData.location,
          website: formData.website,
          twitter: formData.twitter,
          instagram: formData.instagram,
          languages: selectedLanguages,
          interests: selectedInterests,
          private_profile: privateProfile,
          show_activity: showActivity,
          notify_followers: notifyFollowers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save profile.");
      }

      setSavedSnapshot(currentSnapshot);
      showToast("success", "Profile updated.");
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("error", error.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    window.location.reload();
  };

  const handlePhotoUpload = async (event, type) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("error", "Please choose an image file.");
      event.target.value = "";
      return;
    }

    const field = type === "cover" ? "cover_pic" : "profile_pic";
    const endpoint = type === "cover" ? "/profile/update-cover" : "/profile/update-photo";
    const responseKey = type === "cover" ? "cover_pic_url" : "profile_pic_url";
    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);
    setUploadingPhoto(type);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        body: formDataToUpload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not upload the photo.");
      }

      if (!data[responseKey]) {
        throw new Error("The server did not return a photo URL.");
      }

      setFormData((previous) => ({
        ...previous,
        [field]: data[responseKey],
      }));
      showToast("success", type === "cover" ? "Cover photo updated." : "Profile photo updated.");
    } catch (error) {
      console.error("Photo upload failed:", error);
      showToast("error", error.message || "Could not upload the photo.");
    } finally {
      setUploadingPhoto(null);
      event.target.value = "";
    }
  };

  // -----------------------------
  // DERIVED DISPLAY VALUES
  // -----------------------------

  const displayName = formData.name || "Your name";

  const handleText = formData.email
    ? `@${formData.email.split("@")[0]}`
    : "@yourhandle";

  const initial = (formData.name || "U").charAt(0).toUpperCase();

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fc] antialiased">
        <div className="flex items-center gap-3 text-[14px] font-medium text-slate-500">
          <Loader2 size={18} className="animate-spin text-indigo-500" />
          Loading your profile...
        </div>
      </div>
    );
  }

  // -----------------------------
  // PAGE
  // -----------------------------

  return (
    <div className="min-h-screen bg-[#f4f6fc] text-[15px] text-slate-800 antialiased">

      {/* ================= STICKY ACTION BAR ================= */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f4f6fc]/85 backdrop-blur-md">

        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">

          <button
            type="button"
            onClick={() => navigate("/feed")}
            aria-label="Back to profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">

            <h1 className="truncate text-[17px] font-semibold tracking-[-0.02em] text-slate-900">
              Edit profile
            </h1>

            <p className="truncate text-[13px] font-normal text-slate-500">
              {isDirty ? "You have unsaved changes" : "Everything is saved"}
            </p>

          </div>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-slate-600 shadow-sm transition hover:bg-slate-50 sm:block"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Check size={16} />
                Save changes
              </>
            )}
          </button>

        </div>

      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">

        {/* ================= PROFILE HEADER ================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="relative h-40 overflow-hidden bg-linear-to-br from-indigo-950 via-slate-800 to-slate-500">
            {formData.cover_pic && (
              <img
                src={formData.cover_pic}
                alt="Cover"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}

            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => handlePhotoUpload(event, "cover")}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => coverPhotoInputRef.current?.click()}
              disabled={uploadingPhoto !== null}
              className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/30 bg-slate-900/40 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm backdrop-blur-md transition hover:bg-slate-900/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera size={16} />
              {uploadingPhoto === "cover" ? "Uploading..." : "Change cover"}
            </button>
          </div>

          <div className="px-6 pb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                <div className="relative -mt-14 h-28 w-28 shrink-0 rounded-full border-2 border-white bg-white p-1 shadow-lg">

                  {formData.profile_pic ? (
                    <img
                      src={formData.profile_pic}
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.nextSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}

                  <div
                    className={`h-full w-full items-center justify-center rounded-full bg-indigo-50 text-[34px] font-semibold tracking-tight text-indigo-600 ${
                      formData.profile_pic ? "hidden" : "flex"
                    }`}
                  >
                    {initial}
                  </div>

                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => handlePhotoUpload(event, "profile")}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={uploadingPhoto !== null}
                    aria-label="Change profile photo"
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-white shadow-md transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Camera size={15} />
                  </button>

                </div>

                <div className="min-w-0 sm:pb-1">

                  <h2 className="truncate text-[24px] font-semibold leading-tight tracking-[-0.025em] text-slate-900">
                    {displayName}
                  </h2>

                  <p className="truncate text-[15px] font-normal text-slate-500">
                    {handleText}
                  </p>

                </div>

              </div>

              <p className="text-[13px] font-normal leading-5 text-slate-500 sm:max-w-60 sm:text-right">
                Photos are changed from your profile page, using the camera buttons.
              </p>

            </div>

          </div>

        </div>

        {/* ================= BODY ================= */}

        <div className="mt-6 flex gap-6">

          {/* SIDE NAV */}

          <nav className="hidden w-56 shrink-0 lg:block">

            <div className="sticky top-24 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => jumpToSection(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14px] tracking-[-0.01em] transition ${
                    activeSection === id
                      ? "bg-indigo-50 font-semibold text-indigo-600"
                      : "font-normal text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={activeSection === id ? 2.2 : 1.8}
                  />
                  {label}
                </button>
              ))}

            </div>

          </nav>

          {/* FORM */}

          <div className="min-w-0 flex-1 space-y-6">

            {/* ---------- BASIC ---------- */}

            <Section
              id="basic"
              icon={User}
              title="Basic information"
              description="This comes from the account you signed in with."
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <ReadOnlyField
                  label="Full name"
                  value={formData.name}
                  placeholder="Not set"
                />

                <ReadOnlyField
                  label="Email"
                  value={formData.email}
                  placeholder="Not set"
                />

              </div>

              <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[13px] font-normal leading-5 text-slate-500">
                <Lock size={14} className="mt-0.5 shrink-0" />
                Your name and email are managed by your sign-in provider, so they
                can't be edited here.
              </p>

            </Section>

            {/* ---------- BIO ---------- */}

            <Section
              id="bio"
              icon={Feather}
              title="Bio & quote"
              description="The first thing people read on your profile."
            >

              <div className="space-y-5">

                <Textarea
                  label="Bio"
                  value={formData.bio}
                  onChange={(value) => handleChange("bio", value)}
                  placeholder="Write something about yourself..."
                  rows={4}
                  limit={BIO_LIMIT}
                />

                <Textarea
                  label="Favourite quote"
                  value={formData.quote}
                  onChange={(value) => handleChange("quote", value)}
                  placeholder="A line you keep coming back to..."
                  rows={3}
                  limit={QUOTE_LIMIT}
                  serif
                />

              </div>

            </Section>

            {/* ---------- LINKS ---------- */}

            <Section
              id="links"
              icon={LinkIcon}
              title="Location & links"
              description="Where you are and where else people can find you."
            >

              <div className="space-y-5">

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(value) => handleChange("location", value)}
                  placeholder="Ranchi, Jharkhand"
                  icon={MapPin}
                />

                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(value) => handleChange("website", value)}
                  placeholder="https://example.com"
                  icon={Globe}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <Input
                    label="Twitter / X"
                    value={formData.twitter}
                    onChange={(value) => handleChange("twitter", value)}
                    placeholder="username"
                    icon={User}
                    prefix="@"
                  />

                  <Input
                    label="Instagram"
                    value={formData.instagram}
                    onChange={(value) => handleChange("instagram", value)}
                    placeholder="username"
                    icon={Camera}
                    prefix="@"
                  />

                </div>

              </div>

            </Section>

            {/* ---------- LANGUAGES ---------- */}

            <Section
              id="languages"
              icon={LanguagesIcon}
              title="Languages"
              description="The languages you read and write in."
              badge={selectedLanguages.length ? `${selectedLanguages.length} selected` : null}
            >

              <div className="flex flex-wrap gap-2.5">

                {languages.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    selected={selectedLanguages.includes(language)}
                    onClick={() => toggleLanguage(language)}
                    tone="indigo"
                  />
                ))}

              </div>

            </Section>

            {/* ---------- INTERESTS ---------- */}

            <Section
              id="interests"
              icon={Sparkles}
              title="Interests"
              description="Pick what you like reading about. We use these to suggest people."
              badge={selectedInterests.length ? `${selectedInterests.length} selected` : null}
            >

              <div className="flex flex-wrap gap-2.5">

                {interests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    selected={selectedInterests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                    tone="violet"
                  />
                ))}

              </div>

              {selectedInterests.length === 0 && (
                <p className="mt-4 text-[13px] font-normal text-slate-500">
                  Nothing picked yet. Choose a few to get better suggestions.
                </p>
              )}

            </Section>

            {/* ---------- PRIVACY ---------- */}

            <Section
              id="privacy"
              icon={Shield}
              title="Privacy & visibility"
              description="Control what other people can see."
            >

              <div className="divide-y divide-slate-100">

                <ToggleRow
                  title="Private profile"
                  description="Only approved followers can see your posts."
                  checked={privateProfile}
                  onChange={setPrivateProfile}
                />

                <ToggleRow
                  title="Show activity"
                  description="Let others see what you recently liked and posted."
                  checked={showActivity}
                  onChange={setShowActivity}
                />

                <ToggleRow
                  title="Follower notifications"
                  description="Get notified when someone starts following you."
                  checked={notifyFollowers}
                  onChange={setNotifyFollowers}
                />

              </div>

            </Section>

            {/* ---------- ACCOUNT ---------- */}

            <section
              id="account"
              className="scroll-mt-24 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
            >

              <div className="mb-5 flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <TriangleAlert size={19} />
                </div>

                <div>

                  <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-900">
                    Account
                  </h2>

                  <p className="mt-0.5 text-[13px] font-normal text-slate-500">
                    These actions affect your whole account.
                  </p>

                </div>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Deactivate account
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-full bg-rose-500 px-5 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-sm transition hover:bg-rose-600"
                >
                  Delete account
                </button>

              </div>

            </section>

            {/* ---------- BOTTOM SAVE ---------- */}

            <div className="flex items-center justify-end gap-3">

              {isDirty && (
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-[14px] font-semibold tracking-[-0.01em] text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  Discard changes
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="flex items-center gap-2 rounded-full bg-indigo-500 px-7 py-3 text-[14px] font-semibold tracking-[-0.01em] text-white shadow-[0_10px_24px_rgba(79,70,229,0.25)] transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save changes
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================= DELETE CONFIRMATION ================= */}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <TriangleAlert size={20} />
            </div>

            <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
              Delete your account?
            </h3>

            <p className="mt-2 text-[14px] font-normal leading-6 text-slate-500">
              Your posts, saved thoughts and followers are removed permanently.
              This can't be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Keep account
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  showToast("error", "Account deletion isn't wired up yet.");
                }}
                className="rounded-full bg-rose-500 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-rose-600"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= TOAST ================= */}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">

          <div
            className={`flex items-center gap-3 rounded-full py-3 pl-4 pr-3 text-[14px] font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-slate-900" : "bg-rose-500"
            }`}
          >

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              {toast.type === "success" ? <Check size={13} /> : <X size={13} />}
            </span>

            {toast.message}

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// SECTION
// =====================================================

function Section({ id, icon: Icon, title, description, badge, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >

      <div className="mb-5 flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-slate-900">
              {title}
            </h2>

            {badge && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-semibold text-indigo-600">
                {badge}
              </span>
            )}

          </div>

          <p className="mt-0.5 text-[13px] font-normal leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

// =====================================================
// INPUT
// =====================================================

function Input({ label, value, onChange, placeholder, icon: Icon, prefix }) {
  return (
    <div>

      <label className="mb-2 block text-[13px] font-semibold tracking-[-0.01em] text-slate-700">
        {label}
      </label>

      <div className="group relative flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">

        {Icon && (
          <span className="pl-3.5 text-slate-400 transition group-focus-within:text-indigo-500">
            <Icon size={16} />
          </span>
        )}

        {prefix && (
          <span className="pl-2 text-[15px] font-normal text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-transparent py-3 pr-4 text-[15px] font-normal text-slate-800 outline-none placeholder:text-slate-400 ${
            Icon || prefix ? "pl-2" : "pl-4"
          }`}
        />

      </div>

    </div>
  );
}

// =====================================================
// READ-ONLY FIELD
// =====================================================

function ReadOnlyField({ label, value, placeholder }) {
  return (
    <div>

      <label className="mb-2 block text-[13px] font-semibold tracking-[-0.01em] text-slate-700">
        {label}
      </label>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

        <span className="truncate text-[15px] font-normal text-slate-600">
          {value || placeholder}
        </span>

        <Lock size={14} className="ml-auto shrink-0 text-slate-400" />

      </div>

    </div>
  );
}

// =====================================================
// TEXTAREA
// =====================================================

function Textarea({ label, value, onChange, placeholder, rows = 4, limit, serif }) {
  const used = (value || "").length;
  const nearLimit = limit ? used > limit * 0.85 : false;
  const over = limit ? used > limit : false;

  return (
    <div>

      <div className="mb-2 flex items-baseline justify-between gap-3">

        <label className="text-[13px] font-semibold tracking-[-0.01em] text-slate-700">
          {label}
        </label>

        {limit && (
          <span
            className={`text-[12px] font-medium tabular-nums ${
              over
                ? "text-rose-500"
                : nearLimit
                ? "text-amber-500"
                : "text-slate-400"
            }`}
          >
            {used}/{limit}
          </span>
        )}

      </div>

      <textarea
        rows={rows}
        value={value}
        maxLength={limit}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 ${
          serif ? "font-serif text-[17px] leading-7" : "font-normal"
        }`}
      />

    </div>
  );
}

// =====================================================
// CHIP
// =====================================================

function Chip({ label, selected, onClick, tone = "indigo" }) {
  const selectedTone =
    tone === "violet"
      ? "border-violet-500 bg-violet-500 text-white shadow-[0_6px_16px_rgba(139,92,246,0.25)]"
      : "border-indigo-500 bg-indigo-500 text-white shadow-[0_6px_16px_rgba(79,70,229,0.25)]";

  const hoverTone =
    tone === "violet" ? "hover:border-violet-300" : "hover:border-indigo-300";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] font-medium tracking-[-0.01em] transition active:scale-95 ${
        selected
          ? selectedTone
          : `border-slate-200 bg-white text-slate-600 ${hoverTone} hover:text-slate-900`
      }`}
    >
      {selected && <Check size={14} strokeWidth={2.6} />}
      {label}
    </button>
  );
}

// =====================================================
// TOGGLE ROW
// =====================================================

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">

      <div className="min-w-0">

        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900">
          {title}
        </h3>

        <p className="mt-0.5 text-[13px] font-normal leading-5 text-slate-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${
          checked ? "bg-indigo-500" : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
          style={{ left: 0 }}
        />

      </button>

    </div>
  );
}

export default EditProfile;