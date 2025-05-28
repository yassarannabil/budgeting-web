
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListCollapse } from 'lucide-react';
import { format, parseISO } from 'date-fns';


const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatDate = (dateString: string) => {
  try {
    // Assuming dateString is 'yyyy-MM-dd'
    const date = parseISO(dateString + 'T00:00:00'); // Add time part to avoid timezone issues with parseISO
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return dateString; // Fallback to original string if parsing fails
  }
};


interface TransactionHistoryTableProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionHistoryTable({ transactions, limit = 10 }: TransactionHistoryTableProps) {
  const displayedTransactions = transactions.slice(0, limit);

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
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} 
                           className={transaction.type === 'income' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30'}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </TableCell>
                  <TableCell>
                    <div className="whitespace-nowrap">{formatDate(transaction.date)}</div>
                    <div className="text-xs text-muted-foreground">{transaction.time}</div>
                  </TableCell>
                  <TableCell className="truncate max-w-[100px] sm:max-w-[150px]">{transaction.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

