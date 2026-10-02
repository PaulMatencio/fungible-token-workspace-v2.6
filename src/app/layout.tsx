import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'FungibleToken v2.6 — Midnight DApp', template: '%s · FungibleToken v2.6' },
  description:
    'Multisig-governed fungible token on the Midnight preprod network: deploy, mint, transfer and govern with Lace or 1AM wallets and offline cosigners.',
  applicationName: 'FungibleToken v2.6',
  keywords: ['Midnight', 'Compact', 'fungible token', 'multisig', 'zero-knowledge', 'DApp'],
  robots: { index: true, follow: true },
  openGraph: { title: 'FungibleToken v2.6 — Midnight DApp', description: 'Privacy-preserving multisig token on Midnight.', type: 'website' }
};

export const viewport: Viewport = { themeColor: '#070812', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent-strong focus:px-3 focus:py-2">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
