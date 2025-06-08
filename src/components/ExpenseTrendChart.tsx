
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction, DateRange, DateRangeFilter as DateRangeFilterType } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, parseISO, getDay, getMonth, getDate, getFullYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { cn } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile'; // Corrected import path

interface ExpenseTrendChartProps {
  transactions: Transaction[];
  currentFilterType: DateRangeFilterType;
  currentDateRange: DateRange;
}

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const Y_AXIS_WIDTH_DESKTOP = 55;
const Y_AXIS_WIDTH_MOBILE = 35;
const X_AXIS_TICK_FONT_SIZE_DESKTOP = 10;
const X_AXIS_TICK_FONT_SIZE_MOBILE = 9;
const Y_AXIS_TICK_FONT_SIZE_DESKTOP = 10;
const Y_AXIS_TICK_FONT_SIZE_MOBILE = 9;

const LINE_CHART_MARGIN_RIGHT_MOBILE_NON_SCROLL = 60;
const X_AXIS_PADDING_RIGHT_MOBILE_NON_SCROLL = 45;

export function ExpenseTrendChart({
  transactions,
  currentFilterType,
  currentDateRange,
}: ExpenseTrendChartProps) {
  const isMobile = useIsMobile();
  const [chartData, setChartData] = useState<{ name: string; Pengeluaran: number; originalDate: Date }[]>([]);
  const [activeDotKey, setActiveDotKey] = useState<string | null>(null);
  const [xAxisTickFormatter, setXAxisTickFormatter] = useState<(value: string, index: number) => string>(() => (value) => value);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [xAxisInterval, setXAxisInterval] = useState<number | "preserveStartEnd">(0);
  const [isAngled, setIsAngled] = useState(false);
  const [xAxisPadding, setXAxisPadding] = useState({ left: 0, right: 0 });

  const yAxisWidth = isMobile ? Y_AXIS_WIDTH_MOBILE : Y_AXIS_WIDTH_DESKTOP;
  const xAxisTickFontSize = isMobile ? X_AXIS_TICK_FONT_SIZE_MOBILE : X_AXIS_TICK_FONT_SIZE_DESKTOP;
  const yAxisTickFontSize = isMobile ? Y_AXIS_TICK_FONT_SIZE_MOBILE : Y_AXIS_TICK_FONT_SIZE_DESKTOP;
  const dotRadius = isMobile ? 1.5 : 2.5; // Smaller dots for mobile
  const activeDotRadius = isMobile ? 2.5 : 3.5; // Smaller active dots for mobile

  const expenseTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'expense');
  }, [transactions]);

  const chartMinWidth = useMemo(() => {
    if (!needsScroll) return "100%";
    const labelWidthMultiplier = (currentFilterType === 'thisMonth' || currentFilterType === 'custom') ? (isMobile ? 20 : 25) : (isMobile ? 30 : 40);
    return `${Math.max(isMobile ? 300 : 600, chartData.length * labelWidthMultiplier)}px`;
  }, [needsScroll, chartData.length, currentFilterType, isMobile]);


  useEffect(() => {
    if (!currentDateRange.from || expenseTransactions.length === 0) {
      setChartData([]);
      setNeedsScroll(false);
      return;
    }

    const { from, to = from } = currentDateRange;
    let intervalDays: Date[] = [];
    let newXAxisInterval: number | "preserveStartEnd" = 0;
    let newIsAngled = false;
    let newXAxisPadding = { left: 0, right: 0 };

    const dailyExpenses: Record<string, number> = {};
    expenseTransactions.forEach(transaction => {
      const dateKey = format(parseISO(transaction.date), 'yyyy-MM-dd');
      dailyExpenses[dateKey] = (dailyExpenses[dateKey] || 0) + transaction.amount;
    });

    let newFormatter = (value: string, index: number) => value;

    switch (currentFilterType) {
      case 'today':
        intervalDays = [from];
        newFormatter = (value) => format(parseISO(value), 'HH:mm', { locale: idLocale });
        newXAxisInterval = 0; 
        newXAxisPadding = { left: isMobile ? 30 : 50, right: isMobile ? 30 : 50 };
        break;
      case 'thisWeek':
        intervalDays = eachDayOfInterval({ start: startOfWeek(from, { weekStartsOn: 1, locale: idLocale }), end: endOfWeek(from, { weekStartsOn: 1, locale: idLocale }) });
        newFormatter = (value) => format(parseISO(value), 'EEE', { locale: idLocale });
        newXAxisInterval = 0; // Show all 7 days
        newIsAngled = isMobile; // Angle on mobile for 'thisWeek'
        newXAxisPadding = { left: 0, right: isMobile ? X_AXIS_PADDING_RIGHT_MOBILE_NON_SCROLL -5 : 15 };
        break;
      case 'thisMonth':
        intervalDays = eachDayOfInterval({ start: startOfMonth(from), end: endOfMonth(from) });
        newFormatter = (value) => format(parseISO(value), 'd', { locale: idLocale });
        if (isMobile) {
            newXAxisInterval = Math.max(0, Math.floor(intervalDays.length / 4) -1 ); // Aim for ~4-5 labels on mobile
            newIsAngled = true;
        } else {
            newXAxisInterval = intervalDays.length > 20 ? 3 : (intervalDays.length > 10 ? 1 : 0);
            newIsAngled = intervalDays.length > 15;
        }
        newXAxisPadding = { left: 0, right: isMobile ? X_AXIS_PADDING_RIGHT_MOBILE_NON_SCROLL : 20 };
        break;
      case 'thisYear':
        intervalDays = Array.from({ length: 12 }, (_, i) => startOfMonth(new Date(getFullYear(from), i, 1)));
        newFormatter = (value) => format(parseISO(value), 'MMM', { locale: idLocale });
        newXAxisInterval = isMobile ? 2 : 1; 
        newIsAngled = true;
        newXAxisPadding = { left: 0, right: isMobile ? X_AXIS_PADDING_RIGHT_MOBILE_NON_SCROLL -10 : 10 };
        break;
      case 'custom':
        intervalDays = eachDayOfInterval({ start: from, end: to });
        const dayCount = intervalDays.length;
        if (dayCount <= 7) {
          newFormatter = (value) => format(parseISO(value), 'd/M', { locale: idLocale });
          newXAxisInterval = 0;
          newIsAngled = dayCount > (isMobile ? 4 : 5) ; // Angle if more than 4-5 days on mobile
        } else if (dayCount <= 31) {
          newFormatter = (value) => format(parseISO(value), 'd', { locale: idLocale });
          if (isMobile) {
            newXAxisInterval = Math.max(0, Math.floor(dayCount / 4) -1); // Aim for ~4-5 labels
            newIsAngled = true;
          } else {
            newXAxisInterval = dayCount > 20 ? 3 : (dayCount > 10 ? 1 : 0);
            newIsAngled = dayCount > 15;
          }
        } else { 
          newFormatter = (value) => format(parseISO(value), 'MMM d', { locale: idLocale });
          newXAxisInterval = Math.floor(dayCount / (isMobile ? 4 : 7)); 
          newIsAngled = true;
        }
        const scroll = dayCount > 31; // Only scroll if more than 31 days
        setNeedsScroll(scroll);
        newXAxisPadding = { left: 0, right: isMobile && !scroll ? X_AXIS_PADDING_RIGHT_MOBILE_NON_SCROLL : (scroll ? 10 : 20) };
        break;
      default:
        intervalDays = [];
    }

    setXAxisTickFormatter(() => newFormatter);
    setXAxisInterval(newXAxisInterval);
    setIsAngled(newIsAngled);
    setXAxisPadding(newXAxisPadding);

    const data = intervalDays.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return {
        name: dateKey, 
        Pengeluaran: dailyExpenses[dateKey] || 0,
        originalDate: date,
      };
    });

    setChartData(data);
    if (currentFilterType !== 'custom' || intervalDays.length <= 31) {
      setNeedsScroll(false);
    }

  }, [expenseTransactions, currentDateRange, currentFilterType, isMobile]);


  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-primary" />
            Tren Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px] min-h-[200px] sm:min-h-[300px]">
          <p className="text-muted-foreground text-center">
            {expenseTransactions.length === 0 ? "Tidak ada data pengeluaran untuk ditampilkan." : "Pilih rentang tanggal untuk melihat tren."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const lineChartRightMargin = needsScroll ? 20 : (isMobile ? LINE_CHART_MARGIN_RIGHT_MOBILE_NON_SCROLL : 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-primary" />
          Tren Pengeluaran
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("h-[350px] sm:h-[400px] w-full overflow-x-auto pb-8", { "overflow-x-hidden": !needsScroll })}>
        <div style={{ width: chartMinWidth, minHeight: isMobile? '300px' : '350px' }}>
          <ChartContainer
            config={{ Pengeluaran: { label: "Pengeluaran", color: "hsl(var(--primary))" } }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: lineChartRightMargin,
                  left: 0, 
                  bottom: isAngled ? (isMobile ? 40 : 25) : 5, // Increased bottom margin for angled labels on mobile
                }}
                onMouseMove={(e) => {
                  if (e.activePayload && e.activePayload.length > 0) {
                    const dataKey = e.activePayload[0].payload.name;
                    setActiveDotKey(dataKey);
                  } else {
                    setActiveDotKey(null);
                  }
                }}
                onMouseLeave={() => setActiveDotKey(null)}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.7)" />
                <XAxis
                  dataKey="name"
                  tickFormatter={xAxisTickFormatter}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: xAxisTickFontSize, fill: 'hsl(var(--muted-foreground))' }}
                  interval={xAxisInterval}
                  angle={isAngled ? (isMobile ? -60 : -45) : 0} // Increased angle for mobile
                  dy={isAngled ? (isMobile ? 18 : 10) : 5} // Adjusted dy for mobile
                  textAnchor={isAngled ? 'end' : 'middle'}
                  padding={xAxisPadding}
                  minTickGap={isMobile ? 1 : 5} // Reduced minTickGap for mobile
                />
                <YAxis
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return `${value / 1000000}jt`;
                    if (value >= 1000) return `${value / 1000}rb`;
                    return value.toString();
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: yAxisTickFontSize, fill: 'hsl(var(--muted-foreground))' }}
                  width={yAxisWidth}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const originalDate = chartData.find(d => d.name === label)?.originalDate;
                      const formattedDate = originalDate ? format(originalDate, "PPP", { locale: idLocale }) : label;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-1 gap-1.5">
                            <span className="text-sm font-semibold text-muted-foreground">{formattedDate}</span>
                            <span className="font-medium text-primary">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Line
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: dotRadius, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  activeDot={(props: any) => {
                     const { cx, cy, stroke, payload } = props;
                     if (payload.name === activeDotKey) {
                       return <circle cx={cx} cy={cy} r={activeDotRadius + 0.5} fill={stroke} stroke="hsl(var(--background))" strokeWidth={1.5} />;
                     }
                     // Do not render regular dots if there are too many to avoid clutter on mobile
                     if (chartData.length > 15 && isMobile && !needsScroll) return null;
                     return <circle cx={cx} cy={cy} r={dotRadius} fill={stroke} strokeWidth={0} />;
                   }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

    