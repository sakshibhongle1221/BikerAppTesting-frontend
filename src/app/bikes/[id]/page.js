"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "../../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { API_BASE_URL } from "../../../config";

export default function BikeDetailPage() {
  const params = useParams();
  const { id } = params;

  const [user, setUser] = useState(null);
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchBike() {
      if (!id) return;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const idToken = await auth.currentUser.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/bikes/${id}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (res.status === 404) {
          setBike(null);
          setError("Bike not found.");
        } else if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch bike");
        } else {
          const data = await res.json();
          setBike(data.bike || null);
        }
      } catch (err) {
        console.error("Error fetching bike:", err);
        setError(err.message || "Error fetching bike");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchBike();
    }
  }, [id, user]);

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Checking login status...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <p className="mb-4">You must be logged in to view bike details.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Go to home and sign in
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading bike details...</p>
      </main>
    );
  }

  if (!bike) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
        {error && (
          <p className="mb-4 text-red-400 text-center max-w-md">{error}</p>
        )}
        {!error && <p className="mb-4">Bike not found.</p>}
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Back to list
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full space-y-4">
        <Link
          href="/"
          className="inline-block mb-4 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
        >
          Back to list
        </Link>

        <h1 className="text-3xl font-bold">{bike.name}</h1>
        {bike.description && (
          <p className="text-gray-300">{bike.description}</p>
        )}

        <div className="mt-4 space-y-2">
          {bike.engine && (
            <p>
              <span className="font-semibold">Engine:</span> {bike.engine}
            </p>
          )}
          {bike.topSpeed && (
            <p>
              <span className="font-semibold">Top Speed:</span>{" "}
              {bike.topSpeed} km/h
            </p>
          )}
        </div>
      </div>
    </main>
  );
}