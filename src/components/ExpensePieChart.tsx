
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import type { SectorProps } from 'recharts';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

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
      outerRadius={outerRadius + 8} 
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={'hsl(var(--background))'}
      strokeWidth={2}
    />
  );
};


export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setClickedCategory(null);
        if (!isMobile) setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);


  const handlePieSectorClick = (data: any, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const categoryName = expenseData[index]?.name;
    if (categoryName) {
      if (clickedCategory === categoryName) {
        setClickedCategory(null);
        if (!isMobile) setHoveredCategory(null);
      } else {
        setClickedCategory(categoryName);
        if (!isMobile) setHoveredCategory(categoryName);
      }
    }
  };

  const handleListItemClick = (categoryName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (clickedCategory === categoryName) {
      setClickedCategory(null);
      if (!isMobile) setHoveredCategory(null);
    } else {
      setClickedCategory(categoryName);
      if (!isMobile) setHoveredCategory(categoryName);
    }
  };

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="h-5 w-5 mr-2 text-primary" />
            Distribusi Pengeluaran
          </CardTitle>
          {/* <CardDescription>Tidak ada data pengeluaran untuk ditampilkan.</CardDescription> */}
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[300px]">
          <p className="text-muted-foreground">Masukkan beberapa pengeluaran untuk melihat grafik.</p>
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

  return (
    <Card ref={cardRef} onClick={() => {
      setClickedCategory(null);
      if (!isMobile) setHoveredCategory(null);
    }}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-primary" />
          Distribusi Pengeluaran
        </CardTitle>
        {/* <CardDescription>Rincian visual pengeluaran Anda berdasarkan kategori. Klik irisan atau item untuk fokus.</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full mx-auto max-w-xs sm:max-w-sm md:max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
                  if (!isMobile && expenseData[index]?.name) {
                    setHoveredCategory(expenseData[index].name);
                  }
                }}
                onMouseLeave={() => {
                  if (!isMobile) {
                    setHoveredCategory(null);
                  }
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
                      (hoveredCategory === entry.name && clickedCategory !== entry.name && !isMobile)
                        ? 'hsl(var(--foreground))'
                        : 'hsl(var(--card))'
                    }
                    strokeWidth={
                      (hoveredCategory === entry.name && clickedCategory !== entry.name && !isMobile)
                        ? 1.5
                        : 1
                    }
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
                Total Pengeluaran
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6">
            <h3
              className="text-md font-semibold text-center mb-3"
            >
              Ringkasan Pengeluaran per Kategori
            </h3>
            <div className="space-y-2">
              {expenseData.map((entry, index) => {
                const isClicked = clickedCategory === entry.name;
                const isDesktopHovered = hoveredCategory === entry.name && !isClicked && !isMobile;
                const itemColor = COLORS[index % COLORS.length];

                return (
                  <div
                    key={entry.name}
                    className={cn(
                      "flex justify-between items-center p-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer",
                      isClicked
                        ? 'shadow-xl scale-[1.03]'
                        : isDesktopHovered
                          ? 'shadow-md bg-muted'
                          : 'bg-muted/50 hover:bg-muted hover:shadow-sm'
                    )}
                    style={isClicked ? { backgroundColor: itemColor, color: 'hsl(var(--primary-foreground))' } : {}}
                    onMouseEnter={() => {
                      if (!isMobile) setHoveredCategory(entry.name);
                    }}
                    onMouseLeave={() => {
                      if (!isMobile) setHoveredCategory(null);
                    }}
                    onClick={(e) => handleListItemClick(entry.name, e)}
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
                        isClicked ? "opacity-80" : "text-muted-foreground"
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
