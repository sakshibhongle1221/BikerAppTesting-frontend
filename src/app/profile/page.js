"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../firebaseConfig";
import { API_BASE_URL } from "../../config";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bikeName, setBikeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      setLoadingProfile(true);
      setError("");

      try {
        const idToken = await auth. currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch profile");
        }

        const data = await res.json();

        if (!data.profile) {
          router.push("/profile/setup");
          return;
        }

        setProfile(data.profile);
        setName(data. profile.name || "");
        setBikeName(data.profile. bikeName || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Error fetching profile");
      } finally {
        setLoadingProfile(false);
      }
    }

    if (user) {
      fetchProfile();
    }

  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !bikeName. trim()) {
      setError("Both name and bike name are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const idToken = await auth. currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, bikeName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save profile");
      }

      const data = await res.json();
      setProfile({ ...profile, name, bikeName });
      setEditing(false);
    } catch (err) {
      console. error("Error saving profile:", err);
      setError(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Checking login status...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>You must be logged in to view your profile.</p>
      </main>
    );
  }

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <Link
            href="/"
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Back to dasboard
          </Link>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-800 text-sm rounded">{error}</div>
        )}

        {! editing ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">Name</p>
              <p className="text-lg font-semibold">{profile?.name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Your Bike</p>
              <p className="text-lg font-semibold">{profile?.bikeName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Your Bike Name
              </label>
              <input
                type="text"
                value={bikeName}
                onChange={(e) => setBikeName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 px-4 py-2 rounded font-semibold ${
                  saving
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {saving ?  "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(profile?.name || "");
                  setBikeName(profile?.bikeName || "");
                  setError("");
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}