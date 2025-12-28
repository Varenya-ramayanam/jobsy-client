"use client";

import { logout } from "@/lib/auth"; // Make sure the path is correct
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Failed to log out cleanly.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav style={{
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#ffffff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      borderBottom: "1px solid #e0e0e0"
    }}>
      <h3 style={{
        margin: 0,
        color: "#111",
        fontSize: "1.5rem",
        fontWeight: "bold",
        letterSpacing: "0.5px"
      }}>
        Jobsy
      </h3>

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          padding: "8px 20px",
          backgroundColor: isLoggingOut ? "#aaa" : "#111",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: isLoggingOut ? "not-allowed" : "pointer",
          fontWeight: "600",
          transition: "all 0.2s",
          fontSize: "0.9rem"
        }}
        onMouseEnter={(e) => {
          if (!isLoggingOut) e.currentTarget.style.backgroundColor = "#333";
        }}
        onMouseLeave={(e) => {
          if (!isLoggingOut) e.currentTarget.style.backgroundColor = "#111";
        }}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </nav>
  );
}
