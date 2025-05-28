"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  // updateTransaction: (transaction: Transaction) => void; // For future use
  // deleteTransaction: (id: string) => void; // For future use
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [storedTransactions, setStoredTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sync from localStorage on initial load after client-side mount
    setTransactions(storedTransactions);
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // storedTransactions is not needed in dep array due to useLocalStorage internal sync

  useEffect(() => {
    // Persist to localStorage whenever transactions change, if not loading
    if (!isLoading) {
      setStoredTransactions(transactions);
    }
  }, [transactions, setStoredTransactions, isLoading]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
