import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  token: string | null;
  voterHash: string | null;
  constituencyId: string | null;
  login: (token: string, voterHash: string, constituencyId: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [voterHash, setVoterHash] = useState<string | null>(null);
  const [constituencyId, setConstituencyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedVoterHash = await SecureStore.getItemAsync('voterHash');
      const storedConstituencyId = await SecureStore.getItemAsync('constituencyId');
      
      if (storedToken && storedVoterHash && storedConstituencyId) {
        setToken(storedToken);
        setVoterHash(storedVoterHash);
        setConstituencyId(storedConstituencyId);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newVoterHash: string, newConstituencyId: string) => {
    try {
      await SecureStore.setItemAsync('token', newToken);
      await SecureStore.setItemAsync('voterHash', newVoterHash);
      await SecureStore.setItemAsync('constituencyId', newConstituencyId);
      
      setToken(newToken);
      setVoterHash(newVoterHash);
      setConstituencyId(newConstituencyId);
    } catch (error) {
      console.error('Error storing auth:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('voterHash');
      await SecureStore.deleteItemAsync('constituencyId');
      
      setToken(null);
      setVoterHash(null);
      setConstituencyId(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      voterHash,
      constituencyId,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};