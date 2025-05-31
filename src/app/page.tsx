
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { DashboardSummary } from '@/components/DashboardSummary';
// import { ExpensePieChart } from '@/components/ExpensePieChart'; // Moved to /analytics
import { TransactionHistoryTable } from '@/components/TransactionHistoryTable';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PieChart } from 'lucide-react';

export default function DashboardPage() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = useCallback((filterType: DateRangeFilterType, range: DateRange) => {
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
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DateRangeFilter onFilterChange={handleFilterChange} />
      </div>
      
      <DashboardSummary transactions={filteredTransactions} />
      
      {/* Bagian yang dihilangkan:
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Lihat analisa pengeluaran dalam bentuk grafik.</p>
            <Link href="/analytics" passHref legacyBehavior>
                <Button variant="outline">
                    <PieChart className="h-4 w-4 mr-2" />
                    Lihat Analisa Grafik
                </Button>
            </Link>
        </CardContent>
      </Card>
      */}

      <TransactionHistoryTable transactions={filteredTransactions} />
    </div>
  );
}

    
