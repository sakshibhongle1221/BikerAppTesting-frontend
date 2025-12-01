"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebaseConfig";
import { API_BASE_URL } from "../../../config";
import { onAuthStateChanged } from "firebase/auth";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [selectedBikeId, setSelectedBikeId] = useState("");
  
  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(false);

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
    async function fetchBikes() {
      if (! user) return;

      setLoadingBikes(true);
      setError("");

      try {
        const idToken = await auth.currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/bikes`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json(). catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch bikes");
        }

        const data = await res.json();
        setBikes(data. bikes || []);
      } catch (err) {
        console. error("Error fetching bikes:", err);
        setError(err. message || "Error fetching bikes");
      } finally {
        setLoadingBikes(false);
      }
    }

    if (user) {
      fetchBikes();
    }
  }, [user]);

  const handleSave = async (e) => {
    e. preventDefault();
    if (!name. trim()) {
      setError("Name is required.");
      return;
    }
    if (!selectedBikeId) {
      setError("Please select a bike.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const idToken = await auth.currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, bikeId: selectedBikeId }),
      });

      if (!res.ok) {
        const errData = await res.json(). catch(() => ({}));
        throw new Error(errData.error || "Failed to save profile");
      }

      router.push("/profile");
    } catch (err) {
      console.error("Error saving profile:", err);
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
        <p>You must be logged in to set up your profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome! </h1>
          <p className="text-gray-300">
            Let's set up your profile.  Tell us your name and select the bike you ride.
          </p>
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-800 text-sm rounded">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e. target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g.  Sakshi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Your Bike
            </label>
            {loadingBikes ? (
              <p className="text-gray-400 text-sm">Loading bikes...</p>
            ) : bikes.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No bikes available. Please add bikes to Firestore.
              </p>
            ) : (
              <select
                value={selectedBikeId}
                onChange={(e) => setSelectedBikeId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a bike: </option>
                {bikes.map((bike) => (
                  <option key={bike.id} value={bike. id}>
                    {bike. name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || loadingBikes}
            className={`w-full px-4 py-2 rounded font-semibold ${
              saving || loadingBikes
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}