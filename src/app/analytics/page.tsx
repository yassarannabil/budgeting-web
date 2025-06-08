
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTransactions } from '@/contexts/TransactionContext';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { 
  isWithinInterval, parseISO, startOfDay, endOfDay, format, isSameDay,
  addDays, addMonths, addYears, addWeeks,
  startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek,
  isAfter
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnalyticsPage() {
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
      case 'thisWeek':
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

  const isNextNavigationDisabled = useMemo(() => {
    if (!currentDateRange?.from || currentFilterType === 'custom') {
      return true;
    }
    const today = new Date();
    const currentRangeFrom = startOfDay(currentDateRange.from);

    switch (currentFilterType) {
      case 'today':
        return isSameDay(currentRangeFrom, startOfDay(today)) || isAfter(currentRangeFrom, startOfDay(today));
      case 'thisWeek':
        const startOfSelectedWeek = startOfWeek(currentRangeFrom, { weekStartsOn: 1, locale: idLocale });
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1, locale: idLocale });
        return isSameDay(startOfSelectedWeek, startOfCurrentWeek) || isAfter(startOfSelectedWeek, startOfCurrentWeek);
      case 'thisMonth':
        const startOfSelectedMonth = startOfMonth(currentRangeFrom);
        const startOfCurrentMonth = startOfMonth(today);
        return isSameDay(startOfSelectedMonth, startOfCurrentMonth) || isAfter(startOfSelectedMonth, startOfCurrentMonth);
      case 'thisYear':
        const startOfSelectedYear = startOfYear(currentRangeFrom);
        const startOfCurrentYear = startOfYear(today);
        return isSameDay(startOfSelectedYear, startOfCurrentYear) || isAfter(startOfSelectedYear, startOfCurrentYear);
      default:
        return false;
    }
  }, [currentDateRange, currentFilterType]);

  const navigatePeriod = (direction: 'previous' | 'next') => {
    if (!currentDateRange?.from || currentFilterType === 'custom') return;

    if (direction === 'next' && isNextNavigationDisabled) {
      return;
    }

    let newFromDate: Date = currentDateRange.from;
    let newToDate: Date | undefined = currentDateRange.to;
    const D = direction === 'next' ? 1 : -1; 

    switch (currentFilterType) {
      case 'today':
        newFromDate = addDays(currentDateRange.from, D * 1);
        newToDate = newFromDate;
        break;
      case 'thisWeek': {
        const currentWeekStart = startOfWeek(currentDateRange.from, { weekStartsOn: 1, locale: idLocale });
        newFromDate = startOfWeek(addWeeks(currentWeekStart, D * 1), { weekStartsOn: 1, locale: idLocale });
        newToDate = endOfWeek(newFromDate, { weekStartsOn: 1, locale: idLocale });
        break;
      }
      case 'thisMonth': {
        const currentMonthStartForNav = startOfMonth(currentDateRange.from);
        newFromDate = startOfMonth(addMonths(currentMonthStartForNav, D * 1));
        newToDate = endOfMonth(newFromDate);
        break;
      }
      case 'thisYear': {
        const currentYearStartForNav = startOfYear(currentDateRange.from);
        newFromDate = startOfYear(addYears(currentYearStartForNav, D * 1));
        newToDate = endOfYear(newFromDate);
        break;
      }
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
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-col w-full sm:w-auto items-stretch sm:items-end">
            <Skeleton className="h-10 w-full sm:w-48" />
            <Skeleton className="h-4 w-40 mt-2 self-center sm:self-end" />
          </div>
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
        <div className="flex flex-col w-full sm:w-auto items-stretch sm:items-end">
          <DateRangeFilter onFilterChange={handleFilterChange} />
          <div className="flex items-center justify-center sm:justify-end mt-1 gap-1 w-full">
            {currentFilterType !== 'custom' && (
              <Button 
                onClick={handlePrevious} 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                disabled={!currentDateRange?.from}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {displayDateText && (
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-1 min-w-[100px] sm:min-w-[150px]">
                {displayDateText}
              </p>
            )}
            {currentFilterType !== 'custom' && (
              <Button 
                onClick={handleNext} 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                disabled={isNextNavigationDisabled}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <ExpensePieChart transactions={filteredTransactions} />

    </div>
  );
}
    
