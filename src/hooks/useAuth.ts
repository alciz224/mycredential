import { useState, useCallback } from "react";
import { AuthState } from "../types";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    loginAttempts: 0,
  });

  const login = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      isLoggedIn: true,
      loginAttempts: 0,
    }));
  }, []);

  const incrementAttempts = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      loginAttempts: prev.loginAttempts + 1,
    }));
    return authState.loginAttempts + 1;
  }, [authState.loginAttempts]);

  const resetAttempts = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      loginAttempts: 0,
    }));
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isLoggedIn: false,
      loginAttempts: 0,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
    incrementAttempts,
    resetAttempts,
  };
}
