import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Login or register to access your VellaPanti account.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}