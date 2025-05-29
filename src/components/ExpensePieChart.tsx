
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import type { SectorProps } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpensePieChartProps {
  transactions: Transaction[];
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--accent) / 0.7)',
  'hsl(var(--secondary) / 0.7)',
  'hsl(var(--muted-foreground) / 0.5)',
  'hsl(var(--foreground) / 0.6)',
];

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Custom shape for the active (clicked) sector to make it "pop out"
const ActiveSector = (props: SectorProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  if (outerRadius === undefined || innerRadius === undefined || cx === undefined || cy === undefined || startAngle === undefined || endAngle === undefined || fill === undefined) {
    return null;
  }
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8} // Pop out effect
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={'hsl(var(--background))'} // Contrasting border for the popped sector
      strokeWidth={2}
    />
  );
};


export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const listItemsContainerRef = useRef<HTMLDivElement>(null);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseData = useMemo(() => transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existingCategory = acc.find(item => item.name === t.category);
      if (existingCategory) {
        existingCategory.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .map(item => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0,
    }))
    .sort((a,b) => b.value - a.value), [transactions, totalExpenses]);

  const activeIndex = useMemo(() => 
    clickedCategory ? expenseData.findIndex(d => d.name === clickedCategory) : -1,
  [expenseData, clickedCategory]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedOutsideChart = chartRef.current && !chartRef.current.contains(target);
      const clickedOutsideListItems = listItemsContainerRef.current && !listItemsContainerRef.current.contains(target);

      if (clickedOutsideChart && clickedOutsideListItems) {
          setClickedCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-primary" />
            Expense Distribution
          </CardTitle>
          <CardDescription>No expense data available to display.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <p className="text-muted-foreground">Enter some expenses to see the chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig = expenseData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const handlePieSectorClick = (data: any, index: number) => {
    const categoryName = expenseData[index]?.name;
    if (categoryName) {
      setClickedCategory(categoryName === clickedCategory ? null : categoryName);
    }
  };
  
  const handleListItemClick = (categoryName: string) => {
    setClickedCategory(categoryName === clickedCategory ? null : categoryName);
  };

  const handlePieChartAreaClick = (activeSectorPayload: any, event: MouseEvent) => {
    // If activeSectorPayload is null/undefined, it implies a click on the chart's background
    // or a non-interactive part (like the center text), not on an actual data sector.
    if (!activeSectorPayload) {
      // Check if the click originated from a list item to avoid interference.
      if (listItemsContainerRef.current && listItemsContainerRef.current.contains(event.target as Node)) {
        // Click was on a list item, let its own handler manage the state.
        return;
      }
      setClickedCategory(null); // Reset if background of chart was clicked
    }
    // If activeSectorPayload is present, it means a data sector was targeted.
    // The <Pie component's onClick (handlePieSectorClick) is more specific for sector data
    // and should have already handled setting/toggling clickedCategory.
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-primary" />
          Expense Distribution
        </CardTitle>
        <CardDescription>Visual breakdown of your spending by category. Click a slice or item to focus.</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full mx-auto max-w-xs sm:max-w-sm md:max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart onClick={handlePieChartAreaClick}>
                <ChartTooltip
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={65} 
                  labelLine={false}
                  activeIndex={activeIndex}
                  activeShape={ActiveSector as any} 
                  onClick={handlePieSectorClick}
                  onMouseEnter={(data, index) => {
                    if (expenseData[index]?.name) setHoveredCategory(expenseData[index].name);
                  }}
                  onMouseLeave={() => {
                    setHoveredCategory(null);
                  }}
                  label={({ cx, cy, midAngle, innerRadius = 0, outerRadius = 0, percent, index, name }) => {
                      if (typeof innerRadius !== 'number' || typeof outerRadius !== 'number' || typeof midAngle !== 'number' || typeof cx !== 'number' || typeof cy !== 'number') return null;

                      const radius = innerRadius + (outerRadius - innerRadius) * 1.35; 
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      if ((percent ?? 0) * 100 < 3) return null; 
                      return (
                        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] pointer-events-none">
                          {`${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        </text>
                      );
                    }}
                >
                  {expenseData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke={
                        clickedCategory === entry.name || hoveredCategory === entry.name 
                        ? 'hsl(var(--ring))' 
                        : 'hsl(var(--card))'
                      }
                      strokeWidth={clickedCategory === entry.name || hoveredCategory === entry.name ? 2.5 : 1}
                    />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xl font-semibold pointer-events-none"
                  style={{ fill: 'hsl(var(--foreground))' }} 
                >
                  {formatCurrency(totalExpenses)}
                </text>
                <text
                  x="50%"
                  y="58%" 
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs pointer-events-none"
                  style={{ fill: 'hsl(var(--muted-foreground))' }}
                >
                  Total Expenses
                </text>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

         <div className="mt-6">
            <h3 className="text-md font-semibold text-center mb-3">Expense Summary by Category</h3>
            <div ref={listItemsContainerRef} className="space-y-2">
              {expenseData.map((entry, index) => {
                const isClicked = clickedCategory === entry.name;
                const isHovered = hoveredCategory === entry.name && !isClicked;
                const itemColor = COLORS[index % COLORS.length];

                return (
                  <div
                    key={entry.name}
                    className={cn(
                      "flex justify-between items-center p-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer",
                      isClicked ? 'shadow-xl scale-[1.03]' :
                      isHovered ? 'shadow-lg scale-[1.01] bg-accent text-accent-foreground' :
                      'bg-muted/50 hover:bg-muted'
                    )}
                    style={isClicked ? { backgroundColor: itemColor, color: 'hsl(var(--primary-foreground))' } : {}}
                    onMouseEnter={() => setHoveredCategory(entry.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => handleListItemClick(entry.name)}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: isClicked ? 'hsl(var(--primary-foreground))' : itemColor }}
                      ></span>
                      <span className="font-medium text-sm">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatCurrency(entry.value)}</span>
                      <span className={cn(
                        "text-xs ml-2",
                        isClicked ? "opacity-80" : 
                        isHovered ? "text-accent-foreground/80" :
                        "text-muted-foreground"
                      )}>
                        ({entry.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      </CardContent>
    </Card>
  );
}

