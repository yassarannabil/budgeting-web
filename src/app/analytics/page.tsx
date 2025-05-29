
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export default function AnalyticsPage() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = React.useCallback((filterType: DateRangeFilterType, range: DateRange) => {
    setCurrentDateRange(range);
  }, []);
  
  useMemo(() => {
    if (!currentDateRange || !currentDateRange.from) {
      setFilteredTransactions(transactions);
      return;
    }

    const startDate = startOfDay(currentDateRange.from);
    const endDate = currentDateRange.to ? endOfDay(currentDateRange.to) : endOfDay(currentDateRange.from);

    const newFiltered = transactions.filter(transaction => {
      try {
        const transactionDate = parseISO(transaction.date);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      } catch (e) {
        console.error("Error parsing transaction date:", transaction.date, e);
        return false;
      }
    });
    setFilteredTransactions(newFiltered);
  }, [transactions, currentDateRange]);

  if (!isClient || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Analisa Pengeluaran</h1>
        <DateRangeFilter onFilterChange={handleFilterChange} />
      </div>
      
      <ExpensePieChart transactions={filteredTransactions} />

      {/* You can add more analytical components here in the future */}
    </div>
  );
}

    