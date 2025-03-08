import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'customer';
  buildingId?: string;
  roomId?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  createUser: (username: string, password: string, buildingId: string, roomId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getUsers: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const signIn = async (username: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const userData = await response.json();
    setUser(userData); // This will now include buildingId and roomId
  };

  const signOut = () => {
    setUser(null);
  };

  const createUser = async (username: string, password: string, buildingId: string, roomId: string) => {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, buildingId, roomId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }
  };

  const deleteUser = async (userId: string) => {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  };

  const getUsers = async () => {
    const response = await fetch('http://localhost:5000/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: user?.role === 'admin',
      signIn,
      signOut,
      createUser,
      deleteUser,
      getUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}