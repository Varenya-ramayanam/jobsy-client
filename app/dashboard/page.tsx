"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import AutoApplyFilterModal from "@/components/AutoApplyFilterModal";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

interface JobApplication {
  id: string;
  status: string;
  company: string;
  snippet: string;
  timestamp: any;
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ============================
  // AUTH STATE
  // ============================
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubAuth();
  }, []);

  // ============================
  // FIRESTORE LISTENER
  // ============================
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "job_applications"),
      where("userId", "==", uid),
      where("status", "==", "Shortlisted")
    );

    const unsubSnapshot = onSnapshot(q, (snapshot) => {
      const apps: JobApplication[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          status: data.status,
          company: data.company,
          snippet: data.snippet,
          timestamp: data.timestamp,
        };
      });

      setApplications(apps);
      setShortlistedCount(apps.length);
    });

    return () => unsubSnapshot();
  }, [uid]);

  // ============================
  // GMAIL SYNC
  // ============================
  const syncEmails = async () => {
    if (!uid) return setError("User not authenticated.");
    setSyncing(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("google_access_token");
      if (!accessToken)
        throw new Error("Sign in with Google again to refresh access.");

      const res = await fetch("http://localhost:5000/api/process-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, userId: uid }),
      });

      if (!res.ok) throw new Error("AI Scan failed to connect.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  // ============================
  // AUTO APPLY
  // ============================
  const proceedAutoApply = async (filters: any) => {
    setApplying(true);
    try {
      const res = await fetch("http://localhost:8080/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });

      const data = await res.json();
      alert(data.message || "Auto-Apply started successfully");
    } catch {
      alert("Auto-Apply service is offline.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />

      <AutoApplyFilterModal
        open={showFilters}
        onClose={() => setShowFilters(false)}
        onProceed={proceedAutoApply}
      />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold">Career Pipeline</h1>
            <p className="text-gray-500 mt-1">
              AI-powered tracking & automated job applications
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(true)}
              disabled={true} // <--- Disabled permanently
              className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
            >
              🚫 Auto-Apply Disabled (This functionality is restricted to local testing)
            </button>

            <button
              onClick={syncEmails}
              disabled={syncing}
              className="px-4 py-2 rounded-lg border disabled:opacity-60"
            >
              {syncing ? "⌛ Syncing..." : "🔄 Sync Gmail"}
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="border rounded-xl p-6">
            <p className="text-gray-500">SHORTLISTED</p>
            <h2 className="text-3xl font-bold mt-2">{shortlistedCount}</h2>
          </div>
          <div className="border rounded-xl p-6">
            <p className="text-gray-500">TOTAL TRACKED</p>
            <h2 className="text-3xl font-bold mt-2">{applications.length}</h2>
          </div>
        </div>

        {/* SHORTLISTED TABLE */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            📬 Shortlisted Applications
          </h2>

          {applications.length === 0 ? (
            <p className="text-gray-500">
              No shortlisted emails yet. Sync Gmail to fetch updates.
            </p>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Snippet</th>
                    <th className="px-4 py-3">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {app.company}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {app.snippet}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {app.timestamp
                          ? new Date(
                              app.timestamp.seconds * 1000
                            ).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
