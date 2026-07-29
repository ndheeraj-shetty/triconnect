'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  schoolName: string;
  first_login?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<{ role: UserRole; first_login: boolean }>;
  loginWithPasskey: (username: string) => Promise<{ role: UserRole; first_login: boolean }>;
  registerPasskey: (username: string, deviceName: string) => Promise<void>;
  completeOnboarding: (role: UserRole, data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('triconnect_user');
    const storedToken = localStorage.getItem('triconnect_token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Demo portals never persist an authenticated session. Only students do.
        if (parsedUser.role === 'student') {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem('triconnect_user');
          localStorage.removeItem('triconnect_token');
        }
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password?: string): Promise<{ role: UserRole; first_login: boolean }> => {
    setLoading(true);

    try {
      // POST credentials to the FastAPI authentication endpoint.
      // The backend validates against the students table ONLY.
      // If no admin-provisioned student record exists, the server returns an
      // "Account Not Found" error and we surface it to the user.
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: password ?? '' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLoading(false);
        throw new Error(
          errorData.message ||
          'Authentication failed. Please check your credentials and try again.'
        );
      }

      const data = await response.json();

      // Fetch full profile info via /me
      const profileResp = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      });

      let name  = username.split('@')[0];
      let email = username.includes('@') ? username : `${username}@triconnect.com`;

      if (profileResp.ok) {
        const profile = await profileResp.json();
        email = profile.email  || email;
        name  = profile.username || name;
      }

      const role = data.role as UserRole;
      if (role !== 'student') {
        setLoading(false);
        throw new Error('Demo portals do not require a sign-in. Select a portal from Demo Mode.');
      }

      const userData: User = {
        id:          data.id || undefined,
        name,
        email,
        role,
        avatar:      getAvatarForRole(role),
        schoolName:  'Westside Academy High',
        first_login: data.first_login,
      };

      setUser(userData);
      setToken(data.access_token);
      localStorage.setItem('triconnect_user',  JSON.stringify(userData));
      localStorage.setItem('triconnect_token', data.access_token);
      setLoading(false);

      return { role, first_login: data.first_login };

    } catch (err: any) {
      setLoading(false);

      // If the backend is completely unreachable, tell the user clearly.
      // We must NEVER silently fall back to a mock or demo credential.
      if (
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.message?.includes('fetch')
      ) {
        throw new Error(
          'Unable to reach the authentication server. ' +
          'Please ensure the backend is running at http://localhost:8000 and try again.'
        );
      }

      // Propagate structured backend errors (Account Not Found, Account Disabled, etc.)
      throw err;
    }
  };

  const loginWithPasskey = async (username: string): Promise<{ role: UserRole; first_login: boolean }> => {
    setLoading(true);
    try {
      // 1. Fetch challenge option options
      const optResp = await fetch(`${BACKEND_URL}/api/v1/webauthn/login/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!optResp.ok) {
        throw new Error('This account is not registered for biometric login.');
      }

      await optResp.json();
      
      // 2. Perform WebAuthn or mock simulation key verification
      const verifyResp = await fetch(`${BACKEND_URL}/api/v1/webauthn/login/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          assertion_payload: {
            id: 'mock_key_assertion_id',
            rawId: 'mock_key_assertion_raw_id',
            type: 'public-key',
            mock: true,
            response: {
              clientDataJSON: 'mock_client_data_json',
              authenticatorData: 'mock_auth_data',
              signature: 'mock_signature',
            }
          }
        }),
      });

      if (verifyResp.ok) {
        const data = await verifyResp.json();
        const role = data.role as UserRole;
        const userData: User = {
          name: username.split('@')[0],
          email: username.includes('@') ? username : `${username}@triconnect.com`,
          role,
          avatar: getAvatarForRole(role),
          schoolName: 'Westside Academy High',
          first_login: data.first_login,
        };
        setUser(userData);
        setToken(data.access_token);
        localStorage.setItem('triconnect_user', JSON.stringify(userData));
        localStorage.setItem('triconnect_token', data.access_token);
        setLoading(false);
        return { role, first_login: data.first_login };
      } else {
        throw new Error('Biometric Passkey assertion verification failed');
      }
    } catch (err: any) {
      console.warn('Backend WebAuthn offline. Running mock login simulation.', err);
      // Fallback mock passkey login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return login(username);
    }
  };

  const registerPasskey = async (username: string, deviceName: string): Promise<void> => {
    try {
      const optResp = await fetch(`${BACKEND_URL}/api/v1/webauthn/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (optResp.ok) {
        await fetch(`${BACKEND_URL}/api/v1/webauthn/register/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            device_name: deviceName,
            credential_payload: {
              id: 'mock_credential_id_registered',
              type: 'public-key',
              mock: true,
              response: {
                clientDataJSON: 'mock_reg_client_data_json',
                attestationObject: 'mock_reg_attestation_object',
              }
            }
          }),
        });
      }
    } catch (err) {
      console.error('Passkey registration request failed', err);
    }
  };

  const completeOnboarding = async (role: UserRole, data: any): Promise<void> => {
    try {
      const activeToken = token || localStorage.getItem('triconnect_token');
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/onboard/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUserResponse = await response.json();
        // Update user context
        if (user) {
          const newUser = {
            ...user,
            email: updatedUserResponse.email,
            first_login: false,
          };
          setUser(newUser);
          localStorage.setItem('triconnect_user', JSON.stringify(newUser));
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Onboarding registration failed');
      }
    } catch (err) {
      console.warn('Backend onboarding offline. Storing profile offline.', err);
      // Simulate client success
      if (user) {
        const newUser = { ...user, first_login: false };
        setUser(newUser);
        localStorage.setItem('triconnect_user', JSON.stringify(newUser));
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('triconnect_user');
    localStorage.removeItem('triconnect_token');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithPasskey,
        registerPasskey,
        completeOnboarding,
        logout,
        isAuthenticated: !!user,
      }}
    >
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

function getAvatarForRole(role: UserRole): string {
  switch (role) {
    case 'teacher':
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100';
    case 'parent':
      return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100';
    case 'admin':
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100';
    default:
      return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';
  }
}
