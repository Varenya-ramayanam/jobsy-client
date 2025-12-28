import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// 1. Export Login Function
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  // Scopes required for the backend to read Gmail and write to Calendar
  provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
  provider.addScope("https://www.googleapis.com/auth/calendar.events");

  try {
    const result = await signInWithPopup(auth, provider);
    
    // Get the OAuth Access Token from the result
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (token) {
      // Save to localStorage so the Dashboard can access it
      localStorage.setItem("google_access_token", token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error during Google Auth:", error);
    return false;
  }
};

// 2. Export Logout Function
export const logout = async () => {
  try {
    await signOut(auth);
    // Clean up the token
    localStorage.removeItem("google_access_token");
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    return false;
  }
};