import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // If user exists but not on chat page, redirect to chat
        if (window.location.pathname !== '/chat') {
          navigate('/chat');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('chatUser');
      }
    }
    setLoading(false);
  }, [navigate]);

  // Login function
  const login = (username) => {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }

    const userData = {
      id: Date.now().toString(),
      username: username.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      joinedAt: new Date().toISOString(),
    };

    // Save user to local storage
    localStorage.setItem('chatUser', JSON.stringify(userData));
    setUser(userData);

    // Connect socket and join chat
    socket.connect();
    socket.emit('user_join', userData.username);

    return userData;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('chatUser');
    setUser(null);
    socket.disconnect();
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;