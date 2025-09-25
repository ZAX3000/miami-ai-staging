// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
import { polarClient } from '@polar-sh/better-auth';

const base =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: base,
  plugins: [polarClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;