import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safely read the server response
  const getResponseData = async (res) => {
    const text = await res.text();

    console.log("API STATUS:", res.status);
    console.log("API RESPONSE:", text);

    if (!text) {
      throw new Error(`Server returned an empty response (${res.status})`);
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Invalid JSON response:", text);

      throw new Error(
        `Server returned an invalid response (${res.status})`
      );
    }
  };

  // Check logged-in user
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await getResponseData(res);

        if (res.ok) {
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // LOGIN
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

      const data = await getResponseData(res);

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

  // REGISTER
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

      const data = await getResponseData(res);

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

  // LOGOUT
  const logout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await getResponseData(res);

      console.log("Logout response:", data);
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