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
  const [profile, setProfile] = useState(null);
  const [bike, setBike] = useState(null); 
  const [loadingData, setLoadingData] = useState(false);
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
      setProfile(null);
      setBike(null);
      setError("");
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Check console for details.");
    }
  };

  useEffect(() => {
    async function checkProfileAndRedirect() {
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

        if (! data.profile) {
          router.push("/profile/setup");
        } else {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error("Error checking profile:", err);
        setError(err.message || "Error checking profile");
      } finally {
        setCheckingProfile(false);
      }
    }

    if (user) {
      checkProfileAndRedirect();
    }
  }, [user]);

  useEffect(() => {
    async function fetchUserBike() {
      if (!profile || !profile.bikeId) return;

      setLoadingData(true);
      setError("");

      try {
        const idToken = await auth.currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/bikes/${profile.bikeId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json(). catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch bike");
        }

        const data = await res.json();
        setBike(data.bike);
      } catch (err) {
        console.error("Error fetching bike:", err);
        setError(err.message || "Error fetching bike");
      } finally {
        setLoadingData(false);
      }
    }

    if (profile) {
      fetchUserBike();
    }
  }, [profile]);

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
              Sign in with Google to explore your bike. 
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
      <div className="max-w-3xl w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bikers App</h1>
            <p className="text-gray-300">
              Welcome, {profile?.name || user.displayName}!
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
                <p className="font-semibold">{profile?.name || user.displayName}</p>
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

        {error && (
          <div className="mt-2 px-4 py-2 bg-red-800 text-sm rounded">
            {error}
          </div>
        )}

        <section className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Your Bike</h2>

          {loadingData ? (
            <p className="text-gray-400">Loading your bike...</p>
          ) : !bike ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400 mb-4">
                You haven't selected a bike yet. 
              </p>
              <Link
                href="/profile"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold inline-block"
              >
                Select a Bike
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-3xl font-bold">{bike.name}</h3>
                  <p className="text-lg text-gray-300 mt-1">
                    {bike.brand} 
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {bike.topSpeed && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Top Speed</p>
                      <p className="text-lg font-semibold">{bike.topSpeed} km/h</p>
                    </div>
                  )}               
                  {bike.engine && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Engine</p>
                      <p className="text-lg font-semibold">{bike.engine}</p>
                    </div>
                  )}
                  
                </div>

                {bike.description && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Description</p>
                    <p className="text-sm text-gray-300 mt-1">{bike.description}</p>
                  </div>
                )}         
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}