
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollText, PieChartIcon, Plus, Lightbulb, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationBarProps {
  onAddTransactionClick: () => void;
}

const navItems = [
  { href: '/', label: 'Catatan', icon: ScrollText },
  { href: '/analytics', label: 'Analisa', icon: PieChartIcon },
  { isCentralButton: true, label: 'Tambah', icon: Plus, action: 'addTransaction' },
  { href: '/budget-suggestions', label: 'Anggaran', icon: Lightbulb },
  { href: '/account', label: 'Akun', icon: User },
];

export default function BottomNavigationBar({ onAddTransactionClick }: BottomNavigationBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex h-16 items-center justify-around border-t bg-background shadow-top">
      {navItems.map((item, index) => {
        if (item.isCentralButton) {
          return (
            <Button
              key={item.label}
              variant="default"
              size="icon"
              className="h-14 w-14 rounded-full flex-col shadow-lg -translate-y-4 bg-primary hover:bg-primary/90"
              onClick={onAddTransactionClick}
              aria-label="Tambah Transaksi"
            >
              <item.icon className="h-7 w-7 text-primary-foreground" />
            </Button>
          );
        }

        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link href={item.href || '#'} key={item.label} legacyBehavior passHref>
            <a className={cn(
              "flex flex-1 flex-col items-center justify-center p-2 text-xs text-muted-foreground hover:text-primary",
              isActive && "text-primary"
            )}>
              <IconComponent className={cn("h-6 w-6 mb-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
    
