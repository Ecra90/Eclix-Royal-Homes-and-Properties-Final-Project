import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const text = await res.text();

      console.log("AUTH ME STATUS:", res.status);
      console.log("AUTH ME RESPONSE:", text);

      if (!text) {
        setUser(null);
        return;
      }

      const data = JSON.parse(text);
      setUser(data.user || null);
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const text = await res.text();

      console.log("LOGIN STATUS:", res.status);
      console.log("LOGIN RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned an invalid response (${res.status}): ${text || "empty response"}`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (fields) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      const text = await res.text();

      console.log("REGISTER STATUS:", res.status);
      console.log("REGISTER RESPONSE:", text);

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned an invalid response (${res.status}): ${text || "empty response"}`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const text = await res.text();

      console.log("LOGOUT STATUS:", res.status);
      console.log("LOGOUT RESPONSE:", text);
    } catch (error) {
      console.error("Logout error:", error);
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