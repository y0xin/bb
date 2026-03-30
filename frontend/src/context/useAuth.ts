import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Superadmin' | 'Manager' | 'Moderator' | 'Support' | 'Public';

interface StrapiUser {
  id: string;
  username: string;
  role?: { name: string };
  email: string;
}

interface AuthState {
  user: {
    id: string;
    username: string;
    role: Role;
    jwt: string;
  } | null;
  login: (data: { user: StrapiUser; jwt: string }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (data: { user: StrapiUser; jwt: string }) => {
        localStorage.setItem('strapi_jwt', data.jwt);
        set({
          user: { 
            id: data.user.id, 
            username: data.user.username, 
            role: (data.user.role?.name || 'Public') as Role,
            jwt: data.jwt 
          }
        });
      },
      logout: () => {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('strapi_jwt');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
