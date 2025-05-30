
"use client";

import type { Transaction } from '@/types';
import React, { createContext, useContext } from 'react';

interface LayoutActionsContextType {
  openEditTransactionDialog: (transaction: Transaction) => void;
}

export const LayoutActionsContext = createContext<LayoutActionsContextType | undefined>(undefined);

export const useLayoutActions = () => {
  const context = useContext(LayoutActionsContext);
  if (context === undefined) {
    throw new Error('useLayoutActions must be used within a LayoutActionsContext.Provider (likely in AppLayout)');
  }
  return context;
};
