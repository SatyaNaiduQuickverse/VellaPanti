import './globals.css';
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | VellaPanti',
    default: 'VellaPanti - Street Culture • Premium Fashion • Authentic Style',
  },
  description: 'VellaPanti - Premium streetwear and fashion. Discover authentic style with our curated collection of urban clothing and accessories.',
  keywords: 'VellaPanti, streetwear, fashion, urban clothing, premium fashion, street culture, authentic style',
  openGraph: {
    title: 'VellaPanti - Street Culture • Premium Fashion • Authentic Style',
    description: 'VellaPanti - Premium streetwear and fashion. Discover authentic style with our curated collection of urban clothing and accessories.',
    siteName: 'VellaPanti',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VellaPanti - Street Culture • Premium Fashion • Authentic Style',
    description: 'VellaPanti - Premium streetwear and fashion. Discover authentic style with our curated collection of urban clothing and accessories.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.className} ${montserrat.variable} overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartSidebar />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}