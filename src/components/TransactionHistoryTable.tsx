
"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListCollapse } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDateForDisplay = (dateString: string) => {
  try {
    const date = parseISO(dateString + 'T00:00:00');
    return format(date, 'EEEE, MMM dd, yyyy'); // Format seperti "Senin, Nov 08, 2024"
  } catch (error) {
    console.error("Error parsing date for display:", dateString, error);
    return dateString;
  }
};

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionHistoryTable({ transactions, limit = 10 }: TransactionHistoryTableProps) {
  const displayedTransactions = transactions.slice(0, limit);

  const groupedTransactions = displayedTransactions.reduce((acc, transaction) => {
    const dateKey = formatDateForDisplay(transaction.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  if (transactions.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListCollapse className="h-5 w-5 mr-2 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>No transactions recorded yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">Add transactions to see your history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ListCollapse className="h-5 w-5 mr-2 text-primary" />
          Recent Transactions
        </CardTitle>
        <CardDescription>A log of your latest financial activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedTransactions).map(([date, txsOnDate]) => (
                <React.Fragment key={date}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={4} className="py-2 px-4 text-sm font-semibold text-muted-foreground sticky top-0 z-10 bg-muted/50">
                      {date}
                    </TableCell>
                  </TableRow>
                  {txsOnDate.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell 
                        className={cn(
                          "text-right font-medium",
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{transaction.time}</div>
                      </TableCell>
                      <TableCell className="truncate max-w-[100px] sm:max-w-[150px]">{transaction.note || '-'}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
