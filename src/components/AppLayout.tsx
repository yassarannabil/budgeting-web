"use client";

import React, { useState } from 'react';
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
import { LayoutDashboard, Lightbulb, PlusCircle, Settings, BarChart3, CreditCard } from 'lucide-react';
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


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/budget-suggestions', label: 'Budget Suggestions', icon: Lightbulb },
    // Future items
    // { href: '/reports', label: 'Reports', icon: BarChart3 },
    // { href: '/accounts', label: 'Accounts', icon: CreditCard },
    // { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
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
            {navItems.map((item) => (
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
              onClick={() => setIsTransactionDialogOpen(true)}
            >
              <PlusCircle className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Add Transaction</span>
            </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <SidebarTrigger className="sm:hidden" /> {/* Mobile toggle */}
            <div className="flex-1">
              {/* Potentially breadcrumbs or page title */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar>
                    <AvatarImage src="https://placehold.co/32x32.png" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <TransactionDialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen} />
    </SidebarProvider>
  );
}
