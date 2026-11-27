// Context untuk state login user (tersimpan di localStorage)
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('hp_user', JSON.stringify(userData));
    // Update USER_ID global agar api client pakai ID user yang login
    localStorage.setItem('hp_user_id', String(userData.user_id));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hp_user');
    localStorage.removeItem('hp_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
