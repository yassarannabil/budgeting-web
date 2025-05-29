
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

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
];

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

export function ExpensePieChart({ transactions }: ExpensePieChartProps) {
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
    .sort((a,b) => b.value - a.value); // Sort for consistent color assignment

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

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
        <ChartContainer config={chartConfig} className="aspect-square h-[300px] w-full">
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
                innerRadius={65} // Adjusted innerRadius for more space for center text
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    if (percent * 100 < 5) return null; // Hide small percentage labels
                    return (
                      <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text
                x="50%"
                y="48%" // Adjusted y for better vertical centering with two lines
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xl font-semibold"
                style={{ fill: 'hsl(var(--foreground))' }} 
              >
                {formatCurrency(totalExpenses)}
              </text>
              <text
                x="50%"
                y="58%" // Adjusted y for the label below the amount
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
      </CardContent>
    </Card>
  );
}
