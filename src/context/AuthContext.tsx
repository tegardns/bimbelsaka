import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
});

const INACTIVITY_LIMIT = 1000 * 60 * 15; // 15 menit

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const loggedIn =
        !!session && localStorage.getItem("adminAuthenticated") === "true";

      setIsAuthenticated(loggedIn);

      if (loggedIn) {
        startInactivityTimer();
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn =
        !!session && localStorage.getItem("adminAuthenticated") === "true";

      setIsAuthenticated(loggedIn);

      if (loggedIn) {
        startInactivityTimer();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startInactivityTimer = () => {
    let timeout: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(async () => {
        console.log("AUTO LOGOUT");

        await supabase.auth.signOut();

        localStorage.removeItem("adminAuthenticated");

        localStorage.removeItem("adminUsername");

        window.location.replace("/loginadmin");
      }, INACTIVITY_LIMIT);
    };

    // aktivitas yang dihitung
    const events = ["click", "keydown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
