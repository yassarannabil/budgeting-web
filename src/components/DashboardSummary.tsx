
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from '@/types';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardSummaryProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export function DashboardSummary({ transactions }: DashboardSummaryProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {/* Total Income Card */}
      <div className="order-2 col-span-1 md:order-1 md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            {/* <p className="text-xs text-muted-foreground">Dari semua transaksi pemasukan</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Total Expenses Card */}
      <div className="order-3 col-span-1 md:order-2 md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            {/* <p className="text-xs text-muted-foreground">Dari semua transaksi pengeluaran</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Current Balance Card */}
      <div className="order-1 col-span-2 md:order-3 md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            {/* <p className="text-xs text-muted-foreground">Pemasukan dikurangi pengeluaran</p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
