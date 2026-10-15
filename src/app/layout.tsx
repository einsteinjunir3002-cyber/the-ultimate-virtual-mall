import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "The Ultimate Virtual Mall | Ghana's Premier Digital Shopping Destination",
  description:
    'A central digital shopping mall hosting Ghana’s finest independent businesses and artisans. Shop multi-vendor carts with seamless Mobile Money and card payments.',
  keywords: [
    'Ghana e-commerce',
    'Virtual mall Ghana',
    'Mobile Money shopping',
    'Paystack Ghana',
    'Multi-vendor mall',
    'Accra online shopping',
  ],
  authors: [{ name: 'The Ultimate Virtual Mall Platform' }],
  openGraph: {
    title: "The Ultimate Virtual Mall | Ghana's Premier Digital Shopping Destination",
    description:
      'Shop across independent verified Ghanaian merchants under one unified roof with safe Mobile Money and card checkout.',
    siteName: 'The Ultimate Virtual Mall',
    locale: 'en_GH',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
