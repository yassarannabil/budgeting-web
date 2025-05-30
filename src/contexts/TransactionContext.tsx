
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction } from '@/types';
import useLocalStorage from '@/hooks/useLocalStorage';
import { compareDesc, parseISO } from 'date-fns';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Helper function to sort transactions: newest first by date, then by time
const sortTransactions = (transactions: Transaction[]): Transaction[] => {
  return transactions.sort((a, b) => {
    const dateA = parseISO(`${a.date}T${a.time}:00`);
    const dateB = parseISO(`${b.date}T${b.time}:00`);
    return compareDesc(dateA, dateB);
  });
};


export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [storedTransactions, setStoredTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTransactions(sortTransactions(storedTransactions));
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      setStoredTransactions(transactions); // sorted transactions are stored
    }
  }, [transactions, setStoredTransactions, isLoading]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions((prevTransactions) => sortTransactions([newTransaction, ...prevTransactions]));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prevTransactions) => 
      sortTransactions(
        prevTransactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prevTransactions) => 
      sortTransactions(prevTransactions.filter((t) => t.id !== id))
    );
  };


  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, isLoading }}>
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

