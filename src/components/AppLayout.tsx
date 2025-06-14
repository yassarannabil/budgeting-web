
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Lightbulb, PlusCircle, Settings, BarChart3, CreditCard, User, ScrollText, PieChartIcon } from 'lucide-react';
import { TransactionDialog } from './TransactionDialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import BottomNavigationBar from './BottomNavigationBar';
import { LayoutActionsContext } from '@/contexts/LayoutActionsContext';
import type { Transaction } from '@/types';

const commonNavItems = [
  { href: '/', label: 'Dasbor', icon: LayoutDashboard, mobileLabel: 'Catatan', mobileIcon: ScrollText },
  { href: '/analytics', label: 'Analisa Grafik', icon: BarChart3, mobileLabel: 'Analisa', mobileIcon: PieChartIcon },
  { href: '/budget-suggestions', label: 'Saran Anggaran', icon: Lightbulb, mobileLabel: 'Anggaran', mobileIcon: Lightbulb },
  { href: '/account', label: 'Akun', icon: User, mobileLabel: 'Akun', mobileIcon: User },
];

const standalonePages = ['/login', '/signup']; // Add other standalone pages like /forgot-password if needed


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const isMobile = useIsMobile();
  const [pageTitle, setPageTitle] = useState('Dasbor');

  useEffect(() => {
    if (standalonePages.includes(pathname)) {
      // For standalone pages, set a generic title or based on the path
      if (pathname === '/login') setPageTitle('Login');
      else if (pathname === '/signup') setPageTitle('Sign Up');
      else setPageTitle('SpendWise');
      return;
    }

    const currentNavItem = commonNavItems.find(item => item.href === pathname);
    if (currentNavItem) {
      setPageTitle(isMobile ? currentNavItem.mobileLabel : currentNavItem.label);
    } else {
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments.pop();
      let title = lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ') : 'SpendWise';
      if (title === "Privacy policy") title = "Kebijakan Privasi";
      if (title === "Terms of service") title = "Ketentuan Layanan";
      setPageTitle(title);
    }
  }, [pathname, isMobile]);

  const desktopNavItems = commonNavItems.map(item => ({
    href: item.href,
    label: item.label,
    icon: item.icon,
  }));

  const openAddTransactionDialog = () => {
    setTransactionToEdit(null);
    setDialogMode('add');
    setIsTransactionDialogOpen(true);
  };

  const openEditTransactionDialog = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setDialogMode('edit');
    setIsTransactionDialogOpen(true);
  };

  const handleTransactionDialogChange = (open: boolean) => {
    setIsTransactionDialogOpen(open);
    if (!open) {
      setTransactionToEdit(null);
    }
  };

  if (isMobile === undefined) {
    return <div className="flex justify-center items-center h-screen"><PlusCircle className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // If the current page is a standalone page, render children directly
  if (standalonePages.includes(pathname)) {
    return (
      <LayoutActionsContext.Provider value={{ openEditTransactionDialog }}>
        {children}
        {/* TransactionDialog is typically part of the main app layout, so it's excluded here.
            If it needs to be accessible on standalone pages for some reason, it can be added. */}
      </LayoutActionsContext.Provider>
    );
  }


  return (
    <LayoutActionsContext.Provider value={{ openEditTransactionDialog }}>
      {isMobile ? (
        <div className="flex flex-col min-h-screen bg-background">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 py-2">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar>
                    <AvatarImage src="https://placehold.co/32x32.png" alt="Avatar Pengguna" data-ai-hint="user avatar"/>
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <Link href="/account" passHref legacyBehavior><DropdownMenuItem>Pengaturan</DropdownMenuItem></Link>
                <DropdownMenuItem>Bantuan</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Keluar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 pb-20 overflow-auto">
            {children}
          </main>
          <BottomNavigationBar onAddTransactionClick={openAddTransactionDialog} />
        </div>
      ) : (
        <SidebarProvider defaultOpen>
          <Sidebar>
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10ZM50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20Z"/>
                    <path d="M50 30C44.4772 30 40 34.4772 40 40V60C40 65.5228 44.4772 70 50 70C55.5228 70 60 65.5228 60 60V40C60 34.4772 55.5228 30 50 30ZM50 35C52.7614 35 55 37.2386 55 40V60C55 62.7614 52.7614 65 50 65C47.2386 65 45 62.7614 45 60V40C45 37.2386 47.2386 35 50 35Z"/>
                </svg>
                <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">SpendWise</h1>
              </div>
            </SidebarHeader>
            <Separator className="my-2 bg-sidebar-border" />
            <SidebarContent className="p-2">
              <SidebarMenu>
                {desktopNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={item.label}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <Separator className="my-2 bg-sidebar-border" />
            <SidebarFooter className="p-4 space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start group-data-[collapsible=icon]:justify-center"
                  onClick={openAddTransactionDialog}
                >
                  <PlusCircle className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
                  <span className="group-data-[collapsible=icon]:hidden">Tambah Transaksi</span>
                </Button>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
                <SidebarTrigger className="sm:hidden" />
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">{pageTitle}</h1>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="overflow-hidden rounded-full"
                    >
                      <Avatar>
                        <AvatarImage src="https://placehold.co/32x32.png" alt="Avatar Pengguna" data-ai-hint="user avatar" />
                        <AvatarFallback>SW</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/account" passHref legacyBehavior><DropdownMenuItem>Pengaturan</DropdownMenuItem></Link>
                    <DropdownMenuItem>Bantuan</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Keluar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      )}
      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={handleTransactionDialogChange}
        transactionToEdit={transactionToEdit}
        mode={dialogMode}
      />
    </LayoutActionsContext.Provider>
  );
}
