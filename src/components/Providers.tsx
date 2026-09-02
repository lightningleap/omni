"use client";

import { AuthProvider } from '@/context/AuthContext';
import StorefrontTheme from '@/components/StorefrontTheme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Mirrors the selected storefront onto <html> so the Kids accent scale
          reaches portalled UI too — the cart drawer, the modals, the mobile
          menu. Renders nothing; see StorefrontTheme. */}
      <StorefrontTheme />
      {children}
    </AuthProvider>
  );
}
