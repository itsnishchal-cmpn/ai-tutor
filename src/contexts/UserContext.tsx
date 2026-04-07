import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getItem, setItem, removeItem } from '../lib/storage';

interface UserContextValue {
  name: string;
  setName: (name: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState(() => getItem<string>('user_name', ''));

  const setName = useCallback((n: string) => {
    setNameState(n);
    setItem('user_name', n);
  }, []);

  const clearUser = useCallback(() => {
    setNameState('');
    removeItem('user_name');
  }, []);

  return (
    <UserContext.Provider value={{ name, setName, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
