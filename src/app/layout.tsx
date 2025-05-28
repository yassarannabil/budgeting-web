import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from '@/components/AppLayout'; // Import the new AppLayout

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SpendWise - Smart Budgeting',
  description: 'Manage your finances effectively with SpendWise.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans" suppressHydrationWarning>
        <TransactionProvider>
          <AppLayout> {/* Use AppLayout here */}
            {children}
          </AppLayout>
          <Toaster />
        </TransactionProvider>
      </body>
    </html>
  );
}
