import { createContext, useContext, useMemo, useState } from 'react';
import { portalAuthService, PortalAuthUser } from './authService';

export type PortalAuthStatus = 'signed-in' | 'signed-out';

export interface PortalAuthContextValue {
  status: PortalAuthStatus;
  user: PortalAuthUser | null;
  login: (email: string, password: string) => Promise<PortalAuthUser>;
  logout: () => Promise<void>;
  /**
   * `VerifyEmail` calls `portalAuthService.verifyEmail()` directly — it needs
   * the distinct invalid/expired/already-used error codes, which this
   * context does not model. This is just how a successful result joins the
   * shared session afterward.
   */
  completeVerification: (user: PortalAuthUser) => void;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalAuthUser | null>(() => portalAuthService.getSessionSnapshot());

  const value = useMemo<PortalAuthContextValue>(
    () => ({
      status: user ? 'signed-in' : 'signed-out',
      user,
      login: async (email, password) => {
        const result = await portalAuthService.login(email, password);
        setUser(result.user);
        return result.user;
      },
      logout: async () => {
        await portalAuthService.logout();
        setUser(null);
      },
      completeVerification: (verifiedUser) => setUser(verifiedUser)
    }),
    [user]
  );

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    throw new Error('usePortalAuth used outside PortalAuthProvider');
  }
  return ctx;
}
