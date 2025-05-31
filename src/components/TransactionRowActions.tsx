
"use client";

import React, { useState, useRef } from 'react';
import type { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2 } from 'lucide-react';

const SCROLL_THRESHOLD = 10; // pixels

interface TransactionRowActionsProps {
  transaction: Transaction;
  openEditTransactionDialog: (transaction: Transaction) => void;
  setTransactionToDelete: (transaction: Transaction | null) => void;
}

export function TransactionRowActions({
  transaction,
  openEditTransactionDialog,
  setTransactionToDelete,
}: TransactionRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const localDidScrollRef = useRef(false);
  const localTouchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    localTouchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    localDidScrollRef.current = false; // Reset for new touch interaction
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!localTouchStartPosRef.current || localDidScrollRef.current) {
      // Already determined it's a scroll or no start position
      return;
    }
    const deltaX = Math.abs(e.touches[0].clientX - localTouchStartPosRef.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - localTouchStartPosRef.current.y);
    if (deltaX > SCROLL_THRESHOLD || deltaY > SCROLL_THRESHOLD) {
      localDidScrollRef.current = true;
    }
  };

  const handleOpenChange = (openRequestFromRadix: boolean) => {
    if (openRequestFromRadix) { // Radix wants to open the menu
      if (localDidScrollRef.current) {
        // If a scroll was detected for the interaction that led to this open request,
        // reject the open request by ensuring the state remains closed.
        setIsOpen(false);
      } else {
        // No scroll detected, so allow Radix to open the menu.
        setIsOpen(true);
      }
    } else { // Radix wants to close the menu
      setIsOpen(false);
    }
    // Reset scroll flag after any open/close attempt has been processed.
    // This prepares for the next distinct user interaction.
    localDidScrollRef.current = false;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          // onClick is implicitly handled by DropdownMenuTrigger to call onOpenChange
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Opsi</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            openEditTransactionDialog(transaction);
            // Radix will typically call onOpenChange(false) after item execution
          }}
        >
          <Edit3 className="mr-2 h-4 w-4" />
          Ubah
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTransactionToDelete(transaction);
            // Radix will typically call onOpenChange(false) after item execution
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
