'use client';

import { useUser } from './user-provider';
import { LogoutButton } from './logout-button';

export default function AuthStatus() {
  const user = useUser();
  const isLoggedIn = !!user;
  if (!isLoggedIn) return null;
  return <LogoutButton />;
}
