"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

// Define a type for our application data
interface JobApplication {
  id: string;
  company?: string;
  status: string;
  snippet: string;
  timestamp: any;
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [shortlisted, setShortlisted] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Authenticate and set UID
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in as UID:", user.uid);
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // 📊 Real-time Firestore Listener
  useEffect(() => {
    if (!uid) return;

    // We filter by 'userId' to ensure privacy and accuracy
    const q = query(
      collection(db, "job_applications"), 
      where("userId", "==", uid)
    );

    const unsubSnapshot = onSnapshot(q, (snapshot) => {
      let s = 0;
      let r = 0;
      const apps: JobApplication[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "Shortlisted") s++;
        if (data.status === "Rejected") r++;
        
        apps.push({
          id: doc.id,
          status: data.status,
          snippet: data.snippet,
          timestamp: data.timestamp,
        });
      });

      console.log(`Fetched ${apps.length} records for user ${uid}`);
      setApplications(apps);
      setShortlisted(s);
      setRejected(r);
    });

    return () => unsubSnapshot();
  }, [uid]);

  // 🔄 Syncing Logic
  const syncEmails = async () => {
    if (!uid) {
      setError("No user ID found. Please refresh and log in.");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("google_access_token"); 

      if (!accessToken) {
        throw new Error("Missing Google Access Token. Please sign in again.");
      }

      console.log("Starting sync for UID:", uid);

      const res = await fetch("http://localhost:5000/api/process-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          accessToken, 
          userId: uid // 🚀 This is sent to your backend's req.body
        }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process emails");
      }
      
      console.log("Sync response:", data);
      
    } catch (err: any) {
      console.error("Sync Error:", err.message);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />

      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <h2 style={{ margin: 0 }}>Job Tracker Dashboard</h2>
            <p style={{ fontSize: "12px", color: "#666", marginTop: 4 }}>UID: {uid || "Loading..."}</p>
          </div>
          <button 
            onClick={syncEmails} 
            disabled={syncing || !uid}
            style={{
              padding: "12px 24px",
              backgroundColor: syncing ? "#eaeaea" : "#4285F4",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: syncing ? "not-allowed" : "pointer",
              transition: "0.2s"
            }}
          >
            {syncing ? "AI Scanning Inbox..." : "Sync with Gmail AI"}
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "14px", border: "1px solid #fecaca" }}>
            ⚠️ <strong>Error:</strong> {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
          <JobCard title="Shortlisted" count={shortlisted} />
          <JobCard title="Rejected" count={rejected} />
          <JobCard title="Total Tracked" count={applications.length} />
        </div>

        {/* LIST VIEW */}
        <h3 style={{ marginBottom: 16 }}>Live Application Stream</h3>
        {applications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed #ddd", borderRadius: 12, backgroundColor: "#fcfcfc" }}>
            <p style={{ color: "#888", fontSize: "16px" }}>
              {syncing ? "Searching for job updates..." : "No applications tracked yet. Click the Sync button to scan your Gmail!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applications.map((app) => (
              <div key={app.id} style={{ 
                padding: "20px", 
                borderRadius: 12, 
                border: "1px solid #efefef",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}>
                <div style={{ flex: 1, marginRight: 24 }}>
                  <span style={{ fontSize: "10px", fontWeight: "bold", color: "#aaa", letterSpacing: "0.5px" }}>EMAIL SOURCE</span>
                  <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#444", lineHeight: "1.5" }}>
                    {app.snippet}
                  </p>
                </div>
                <div style={{ 
                  padding: "6px 14px", 
                  borderRadius: 6, 
                  fontSize: "11px", 
                  fontWeight: "800",
                  letterSpacing: "0.5px",
                  backgroundColor: app.status === "Shortlisted" ? "#ecfdf5" : "#fff1f2",
                  color: app.status === "Shortlisted" ? "#059669" : "#e11d48",
                  border: `1px solid ${app.status === "Shortlisted" ? "#a7f3d0" : "#fecdd3"}`
                }}>
                  {app.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}