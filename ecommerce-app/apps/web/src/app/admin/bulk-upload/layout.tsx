import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Upload - Admin',
  description: 'Upload multiple products at once using Excel files.',
};

export default function BulkUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}