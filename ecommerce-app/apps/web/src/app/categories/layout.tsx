import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Explore our fashion categories - from streetwear to premium collections at VellaPanti.',
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}