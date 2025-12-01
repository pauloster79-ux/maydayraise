'use client';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut()} 
      className="text-red-400 hover:text-red-300 text-sm"
    >
      Sign Out
    </button>
  );
}

