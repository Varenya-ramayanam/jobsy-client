"use client";

import { logout } from "@/lib/auth"; // Ensure this path is correct based on your folder structure
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to login page after successful cleanup
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
      borderBottom: "1px solid #eaeaea"
    }}>
      <h3 style={{ margin: 0, color: "#4285F4" }}>Email Tracker AI</h3>
      
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          padding: "8px 16px",
          backgroundColor: isLoggingOut ? "#ccc" : "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoggingOut ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </nav>
  );
}