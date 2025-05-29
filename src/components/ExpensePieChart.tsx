
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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
  'hsl(var(--secondary) / 0.7)', // Added more colors for variety
  'hsl(var(--muted-foreground) / 0.5)',
  'hsl(var(--foreground) / 0.6)',
];

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseData = transactions
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
    .sort((a,b) => b.value - a.value); // Sort for consistent color assignment and list order

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


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-primary" />
          Expense Distribution
        </CardTitle>
        <CardDescription>Visual breakdown of your spending by category.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full mx-auto max-w-xs sm:max-w-sm md:max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
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
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.3; // Move label slightly outside
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    if (percent * 100 < 3) return null; 
                    return (
                      <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                onMouseEnter={(data) => {
                  setHoveredCategory(data.name);
                }}
                onMouseLeave={() => {
                  setHoveredCategory(null);
                }}
              >
                {expenseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={hoveredCategory === entry.name ? 'hsl(var(--ring))' : 'hsl(var(--card))'} // Highlight border on hover
                    strokeWidth={hoveredCategory === entry.name ? 2 : 1}
                  />
                ))}
              </Pie>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xl font-semibold"
                style={{ fill: 'hsl(var(--foreground))' }} 
              >
                {formatCurrency(totalExpenses)}
              </text>
              <text
                x="50%"
                y="58%" 
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs"
                style={{ fill: 'hsl(var(--muted-foreground))' }}
              >
                Total Expenses
              </text>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-6 space-y-2">
          <h3 className="text-md font-semibold text-center mb-3">Expense Summary by Category</h3>
          {expenseData.map((entry, index) => (
            <div
              key={entry.name}
              className={cn(
                "flex justify-between items-center p-3 rounded-lg transition-all duration-200 ease-in-out",
                hoveredCategory === entry.name ? "bg-accent text-accent-foreground shadow-lg scale-[1.02]" : "bg-muted/50 hover:bg-muted"
              )}
              onMouseEnter={() => setHoveredCategory(entry.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium">{entry.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{formatCurrency(entry.value)}</span>
                <span className={cn(
                  "text-xs ml-2",
                  hoveredCategory === entry.name ? "text-accent-foreground/80" : "text-muted-foreground"
                )}>
                  ({entry.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
