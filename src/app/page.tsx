
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { DashboardSummary } from '@/components/DashboardSummary';
import { TransactionHistoryTable } from '@/components/TransactionHistoryTable';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { isWithinInterval, parseISO, startOfDay, endOfDay, format, isSameDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PieChart } from 'lucide-react';

export default function DashboardPage() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [currentDateRange, setCurrentDateRange] = useState<DateRange | null>(null);
  const [currentFilterType, setCurrentFilterType] = useState<DateRangeFilterType>('thisMonth');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = useCallback((filterType: DateRangeFilterType, range: DateRange) => {
    setCurrentFilterType(filterType);
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

  const displayDateText = useMemo(() => {
    if (!currentDateRange?.from || !currentFilterType) return "";

    const fromDate = currentDateRange.from;
    const toDate = currentDateRange.to;

    switch (currentFilterType) {
      case 'today':
        return format(fromDate, "PPP", { locale: idLocale });
      case 'last7days':
        return toDate ? `${format(fromDate, "PPP", { locale: idLocale })} - ${format(toDate, "PPP", { locale: idLocale })}` : format(fromDate, "PPP", { locale: idLocale });
      case 'thisMonth':
        return format(fromDate, "MMMM yyyy", { locale: idLocale });
      case 'thisYear':
        return format(fromDate, "yyyy", { locale: idLocale });
      case 'custom':
        if (!toDate || isSameDay(fromDate, toDate)) {
          return format(fromDate, "PPP", { locale: idLocale });
        }
        return `${format(fromDate, "PPP", { locale: idLocale })} - ${format(toDate, "PPP", { locale: idLocale })}`;
      default:
        if (!toDate || isSameDay(fromDate, toDate)) {
          return format(fromDate, "PPP", { locale: idLocale });
        }
        return `${format(fromDate, "PPP", { locale: idLocale })} - ${format(toDate, "PPP", { locale: idLocale })}`;
    }
  }, [currentDateRange, currentFilterType]);

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
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex flex-col w-full sm:w-auto items-stretch sm:items-end">
          <DateRangeFilter onFilterChange={handleFilterChange} />
          {displayDateText && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center sm:text-right px-1">
              {displayDateText}
            </p>
          )}
        </div>
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
    
