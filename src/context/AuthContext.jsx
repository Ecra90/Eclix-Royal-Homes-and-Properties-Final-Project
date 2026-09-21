import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Your deployed Flask backend
const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Safely handle API responses.
   *
   * We DO NOT blindly call response.json().
   * This is important because if Vercel/Flask returns HTML,
   * JSON.parse() would normally crash with:
   *
   * JSON.parse: unexpected character at line 1 column 1
   */
  const getResponseData = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();

    console.log("=================================");
    console.log("API REQUEST");
    console.log("Status:", res.status);
    console.log("Content-Type:", contentType);
    console.log("Response:", text);
    console.log("=================================");

    // Empty response
    if (!text.trim()) {
      return {
        success: false,
        error: `Server returned an empty response (${res.status})`,
      };
    }

    // Try JSON regardless of the content-type.
    // This handles Flask responses correctly even if headers are unusual.
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("❌ Backend did NOT return valid JSON.");
      console.error("HTTP Status:", res.status);
      console.error("Content-Type:", contentType);
      console.error("Raw response:", text);

      // Give a much more useful error than the original JSON.parse error.
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        throw new Error(
          `The backend returned an HTML page instead of JSON. HTTP ${res.status}. ` +
            `Check your Vercel backend URL and Flask deployment.`
        );
      }

      throw new Error(
        `The backend returned an invalid response. HTTP ${res.status}.`
      );
    }
  };

  /*
   * Check whether the user is already logged in.
   */
  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await getResponseData(res);

        if (!mounted) return;

        if (res.ok && data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Authentication check failed:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * LOGIN
   */
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await getResponseData(res);

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || `Login failed (${res.status})`
        );
      }

      if (!data?.user) {
        throw new Error("Login succeeded but no user was returned by the server.");
      }

      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  /*
   * REGISTER
   */
  const register = async (fields) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
      });

      const data = await getResponseData(res);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Registration failed (${res.status})`
        );
      }

      if (!data?.user) {
        throw new Error(
          "Registration succeeded but no user was returned by the server."
        );
      }

      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  };

  /*
   * LOGOUT
   */
  const logout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await getResponseData(res);

      console.log("Logout response:", data);
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);