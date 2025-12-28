"use client";

import { loginWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.push("/dashboard");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh" 
    }}>
      <h1>Job Tracker AI</h1>
      <p>Sign in to scan your job applications automatically</p>
      
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          marginTop: "20px"
        }}
      >
        {loading ? "Authorizing..." : "Sign in with Google"}
      </button>
      
      <p style={{ fontSize: "12px", marginTop: "10px", color: "#666" }}>
        Note: You will need to grant Gmail & Calendar permissions.
      </p>
    </div>
  );
}