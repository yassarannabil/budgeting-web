"use client";

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import type { DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onFilterChange: (filterType: DateRangeFilterType, range: DateRange) => void;
}

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState<DateRangeFilterType>('thisMonth');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    // Initialize with 'thisMonth'
    const now = new Date();
    onFilterChange('thisMonth', { from: startOfMonth(now), to: endOfMonth(now) });
  }, [onFilterChange]);

  const handleFilterTypeChange = (value: string) => {
    const filterType = value as DateRangeFilterType;
    setSelectedFilter(filterType);
    let range: DateRange;
    const now = new Date();

    switch (filterType) {
      case 'today':
        range = { from: now, to: now };
        break;
      case 'last7days':
        range = { from: subDays(now, 6), to: now };
        break;
      case 'thisMonth':
        range = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case 'thisYear':
        range = { from: startOfYear(now), to: endOfYear(now) };
        break;
      case 'custom':
        // If switching to custom, use current customDateRange or default to this month
        range = customDateRange.from ? customDateRange : { from: startOfMonth(now), to: endOfMonth(now) };
        setIsPopoverOpen(true); // Open popover for custom range selection
        break;
      default:
        range = { from: startOfMonth(now), to: endOfMonth(now) };
    }
    if (filterType !== 'custom') {
      setCustomDateRange(range); // Sync customDateRange if not custom
      setIsPopoverOpen(false); // Close popover if not custom
    }
    onFilterChange(filterType, range);
  };
  
  const handleCustomDateChange = (range: DateRange | undefined) => {
    if (range?.from) {
      const newRange = {from: range.from, to: range.to || range.from };
      setCustomDateRange(newRange);
      // Only apply if custom is already selected, otherwise it's just updating the popover state
      if (selectedFilter === 'custom') {
        onFilterChange('custom', newRange);
      }
    }
  };
  
  const applyCustomRange = () => {
    if(customDateRange.from){
      onFilterChange('custom', customDateRange);
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <Select value={selectedFilter} onValueChange={handleFilterTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="thisYear">This Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {selectedFilter === 'custom' && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !customDateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customDateRange.from ? (
                customDateRange.to ? (
                  <>
                    {format(customDateRange.from, "LLL dd, y")} -{" "}
                    {format(customDateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(customDateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customDateRange?.from}
              selected={customDateRange}
              onSelect={handleCustomDateChange}
              numberOfMonths={2}
            />
            <div className="p-2 border-t">
              <Button onClick={applyCustomRange} size="sm" className="w-full">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
