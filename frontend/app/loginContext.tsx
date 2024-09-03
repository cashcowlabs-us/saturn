import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoginContextType {
  isLogin: boolean;
  login: (password: string) => Promise<void>;
  error: string;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState('');

  const login = async (password: string) => {
    const hardcodedPassword = '123Catch!i'; // Hardcoded password

    if (password === hardcodedPassword) {
      setIsLogin(true);
      setError('');
    } else {
      setIsLogin(false);
      setError('Incorrect password!');
    }
  };

  return (
    <LoginContext.Provider value={{ isLogin, login, error }}>
      {children}
    </LoginContext.Provider>
  );
};
