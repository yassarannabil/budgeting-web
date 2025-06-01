
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { DashboardSummary } from '@/components/DashboardSummary';
import { TransactionHistoryTable } from '@/components/TransactionHistoryTable';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { 
  isWithinInterval, parseISO, startOfDay, endOfDay, format, isSameDay,
  addDays, addMonths, addYears, subDays, subMonths, subYears,
  startOfMonth, endOfMonth, startOfYear, endOfYear
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PieChart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  const initialDateRange = useMemo(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfMonth(now) };
  }, []);

  const [currentDateRange, setCurrentDateRange] = useState<DateRange>(initialDateRange);
  const [currentFilterType, setCurrentFilterType] = useState<DateRangeFilterType>('thisMonth');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFilterChange = useCallback((filterType: DateRangeFilterType, range: DateRange) => {
    setCurrentFilterType(filterType);
    setCurrentDateRange(range);
  }, []);
  
  useEffect(() => {
    if (!currentDateRange?.from) {
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

  const navigatePeriod = (direction: 'previous' | 'next') => {
    if (!currentDateRange?.from || currentFilterType === 'custom') return;

    let newFromDate: Date = currentDateRange.from;
    let newToDate: Date | undefined = currentDateRange.to;
    const D = direction === 'next' ? 1 : -1;

    switch (currentFilterType) {
      case 'today':
        newFromDate = addDays(currentDateRange.from, D * 1);
        newToDate = newFromDate;
        break;
      case 'last7days':
        newFromDate = addDays(currentDateRange.from, D * 7);
        newToDate = currentDateRange.to ? addDays(currentDateRange.to, D * 7) : undefined;
        break;
      case 'thisMonth':
        const currentMonthStartForNav = startOfMonth(currentDateRange.from);
        newFromDate = startOfMonth(addMonths(currentMonthStartForNav, D * 1));
        newToDate = endOfMonth(newFromDate);
        break;
      case 'thisYear':
        const currentYearStartForNav = startOfYear(currentDateRange.from);
        newFromDate = startOfYear(addYears(currentYearStartForNav, D * 1));
        newToDate = endOfYear(newFromDate);
        break;
      // No 'custom' case needed here due to the check at the beginning of the function
      default:
        return;
    }
    setCurrentDateRange({ from: newFromDate, to: newToDate });
  };

  const handlePrevious = () => navigatePeriod('previous');
  const handleNext = () => navigatePeriod('next');

  if (!isClient || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-8 w-36" />
          <div className="flex flex-col w-full sm:w-auto items-stretch sm:items-end">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-4 w-40 mt-2 self-center sm:self-end" />
          </div>
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
          <div className="flex items-center justify-center sm:justify-end mt-1 gap-1 w-full">
            <Button 
              onClick={handlePrevious} 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              disabled={!currentDateRange?.from || currentFilterType === 'custom'}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {displayDateText && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-1 min-w-[100px] sm:min-w-[150px]">
                {displayDateText}
              </p>
            )}
            <Button 
              onClick={handleNext} 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              disabled={!currentDateRange?.from || currentFilterType === 'custom'}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <DashboardSummary transactions={filteredTransactions} />
      
      <TransactionHistoryTable transactions={filteredTransactions} />
    </div>
  );
}
    
