"use client";

import { loginWithGoogle } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelopeOpenText, FaLinkedin } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.push("/dashboard"); // Redirect to dashboard after login
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

  const features = [
    {
      icon: <FaEnvelopeOpenText className="text-gray-800 w-6 h-6" />,
      title: "Email Sync",
      desc: "Automatically scan and categorize your job application emails.",
    },
    {
      icon: <FaLinkedin className="text-gray-800 w-6 h-6" />,
      title: "LinkedIn Apply",
      desc: "Apply to LinkedIn easy-apply jobs automatically (This functionality is restricted to local testing)",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      
      {/* Login Card */}
      <div className="bg-white shadow-lg rounded-3xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Jobsy</h1>
        <p className="text-gray-700 mb-8 text-sm">
          Smart AI-powered job tracker. Track your applications and apply to LinkedIn jobs automatically.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-xl text-white font-bold shadow-md transition-all duration-300 ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 transform hover:scale-105"
          }`}
        >
          {loading ? "Authorizing..." : "Sign in with Google"}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Requires Gmail permissions for email syncing.
        </p>
      </div>

      {/* Features Section */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {feature.icon}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-700 text-sm">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
