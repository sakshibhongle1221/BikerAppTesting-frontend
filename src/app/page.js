"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import { API_BASE_URL } from "../config";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [bikes, setBikes] = useState([]);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [error, setError] = useState("");
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setError("");
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      setError("Failed to sign in. Check console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setBikes([]);
      setError("");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Check console for details.");
    }
  };

  const fetchBikes = async () => {
    if (!user) {
      setError("You must be logged in to load bikes.");
      return;
    }

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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch bikes");
      }

      const data = await res.json();
      setBikes(data.bikes || []);
    } catch (err) {
      console.error("Error fetching bikes:", err);
      setError(err.message || "Error fetching bikes");
    } finally {
      setLoadingBikes(false);
    }
  };

  useEffect(() => {
    async function checkProfile() {
      if (!user) return;

      setCheckingProfile(true);

      try {
        const idToken = await auth.currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to check profile");
        }

        const data = await res.json();

        if (!data.profile) {
          router.push("/profile/setup");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      } finally {
        setCheckingProfile(false);
      }
    }

    if (user) {
      checkProfile();
    }

  }, [user]);

  useEffect(() => {
    if (user && !checkingProfile) {
      fetchBikes();
    } else {
      setBikes([]);
    }
  }, [user, checkingProfile]);

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-300">Checking login status...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-center">Bikers App</h1>
            <p className="text-gray-300 text-center">
              Sign in with Google to explore different bikes. 
            </p>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-800 text-sm rounded text-center">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleGoogleLogin}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold"
            >
              Sign in with Google
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            We use Firebase Authentication to securely sign you in with your
            Google account. 
          </p>
        </div>
      </main>
    );
  }

  if (checkingProfile) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-300">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bikers App</h1>
            <p className="text-gray-300">
              explore different bikes.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              {user. photoURL && (
              <Link href="/profile">
               <img
                src={user.photoURL}
                alt="User avatar"
                className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
               />
              </Link>
              )}
              <div className="text-sm">
                <p className="font-semibold">{user.displayName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="mt-4">
          <h2 className="text-2xl font-semibold">
            Hello, welcome to the bikers app!
          </h2>
          <p className="text-gray-300 mt-2">
            Select the bike you want to know about from the list below.
          </p>
        </section>

        {error && (
          <div className="mt-2 px-4 py-2 bg-red-800 text-sm rounded">
            {error}
          </div>
        )}

        <section className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Available Bikes</h3>
            <button
              onClick={fetchBikes}
              disabled={loadingBikes}
              className={`px-3 py-1 rounded text-sm ${
                loadingBikes
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingBikes ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingBikes ? (
            <p className="text-gray-400">Loading bikes...</p>
          ) : bikes.length === 0 ? (
            <p className="text-gray-400">
              No bikes found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bikes.map((bike) => (
                <Link
                  key={bike.id}
                  href={`/bikes/${bike.id}`}
                  className="bg-gray-800 hover:bg-gray-700 rounded-lg overflow-hidden shadow-md transition transform hover:-translate-y-1"
                >
                  {bike.imageUrl && (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={bike.imageUrl}
                        alt={bike.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-1">
                    <h4 className="text-lg font-semibold">{bike.name}</h4>
                    <p className="text-sm text-gray-400">
                      {bike.brand} • {bike.type}
                    </p>
                    {bike.price && (
                      <p className="text-sm text-green-400 font-medium">
                        Price:{" "}
                        {typeof bike.price === "number"
                          ? `₹${bike.price.toLocaleString("en-IN")}`
                          : bike.price}
                      </p>
                    )}
                    {bike.topSpeed && (
                      <p className="text-xs text-gray-300">
                        Top Speed: {bike.topSpeed} km/h
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}