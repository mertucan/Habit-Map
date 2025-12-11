import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Yerel durumu temizlemek için yardımcı fonksiyon
  const clearAuthState = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Yüklemede yerel depolamayı kontrol et
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // 401'leri (süresi dolmuş oturum) işlemek için Axios engelleyici
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Eğer 401 alırsak, oturumumuz geçersiz demektir.
          // Giriş sayfasına yönlendirmek için yerel olarak çıkış yapmalıyız.
          clearAuthState();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/login', { username, password });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      await api.post('/register', { username, email, password });
      return { success: true };
    } catch (error) {
      console.error("Registration failed", error);
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      clearAuthState();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
