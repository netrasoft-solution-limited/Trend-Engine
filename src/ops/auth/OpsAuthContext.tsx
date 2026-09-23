import { createContext, useContext, useMemo, useState } from 'react';
import { opsAuthService, OpsUser } from './opsAuthService';

export type OpsAuthStatus = 'signed-in' | 'signed-out';

export interface OpsAuthContextValue {
  status: OpsAuthStatus;
  user: OpsUser | null;
  login: (email: string, password: string) => Promise<{ mfaRequired: true }>;
  verifyCode: (code: string) => Promise<OpsUser>;
  logout: () => Promise<void>;
}

const OpsAuthContext = createContext<OpsAuthContextValue | null>(null);

export function OpsAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<OpsUser | null>(() => opsAuthService.getSessionSnapshot());

  const value = useMemo<OpsAuthContextValue>(
    () => ({
      status: user ? 'signed-in' : 'signed-out',
      user,
      login: (email, password) => opsAuthService.login(email, password),
      verifyCode: async (code) => {
        const result = await opsAuthService.verifyCode(code);
        setUser(result.user);
        return result.user;
      },
      logout: async () => {
        await opsAuthService.logout();
        setUser(null);
      }
    }),
    [user]
  );

  return <OpsAuthContext.Provider value={value}>{children}</OpsAuthContext.Provider>;
}

export function useOpsAuth(): OpsAuthContextValue {
  const ctx = useContext(OpsAuthContext);
  if (!ctx) {
    throw new Error('useOpsAuth used outside OpsAuthProvider');
  }
  return ctx;
}
