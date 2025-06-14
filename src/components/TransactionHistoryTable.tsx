
"use client";

import React, { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListCollapse } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransactions } from '@/contexts/TransactionContext';
import { buttonVariants } from "@/components/ui/button";
import { TransactionRowActions } from './TransactionRowActions'; 

const formatDateForDisplay = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, dd MMMM yyyy', { locale: idLocale });
  } catch (error) {
    console.error("Error parsing date for display:", dateString, error);
    return dateString;
  }
};

const formatCurrencyForHistory = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  const { deleteTransaction, isLoading: transactionsLoading } = useTransactions(); // Added isLoading
  const { openEditTransactionDialog } = useLayoutActions();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const displayedTransactions = transactions;

  const groupedTransactions = displayedTransactions.reduce((acc, transaction) => {
    const dateKey = formatDateForDisplay(transaction.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  if (transactions.length === 0 && !transactionsLoading) { // Check for loading state too
     return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ListCollapse className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>Transaksi Terkini</CardTitle>
            </div>
             <span
                onClick={() => setIsEditMode(prev => !prev)}
                className="text-sm text-primary hover:underline cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditMode(prev => !prev); }}
                aria-pressed={isEditMode}
              >
                {isEditMode ? 'Selesai' : 'Ubah'}
            </span>
          </div>
          {/* <CardDescription className="mt-1">Belum ada transaksi yang dicatat.</CardDescription> */}
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">Tambah transaksi untuk melihat riwayat Anda.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Optional: Add a loading state indicator if needed
  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
           <div className="flex items-center">
             <ListCollapse className="h-5 w-5 mr-2 text-primary" />
             <CardTitle>Transaksi Terkini</CardTitle>
           </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">Memuat transaksi...</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ListCollapse className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Transaksi Terkini</CardTitle>
          </div>
          <span
            onClick={() => setIsEditMode(prev => !prev)}
            className="text-sm text-primary hover:underline cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsEditMode(prev => !prev); }}
            aria-pressed={isEditMode}
          >
            {isEditMode ? 'Selesai' : 'Ubah'}
          </span>
        </div>
        {/* <CardDescription className="mt-1">Catatan aktivitas keuangan terakhir Anda.</CardDescription> */}
      </CardHeader>
      <CardContent className="p-6 pt-2"> {/* Adjusted pt from pt-0 to pt-2 */}
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableBody>
              {Object.entries(groupedTransactions).map(([date, txsOnDate]) => (
                <React.Fragment key={date}>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={2} className="py-2 px-4 text-sm font-semibold text-muted-foreground sticky top-0 z-10 bg-muted/50">
                      {date}
                    </TableCell>
                  </TableRow>
                  {txsOnDate.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="py-3 px-4">
                        <div className="font-medium">{transaction.category}</div>
                        <div className="text-xs text-muted-foreground break-all">{transaction.note || '-'}</div>
                      </TableCell>
                      <TableCell className="text-right py-3 px-4">
                        <div className="flex justify-end items-center space-x-2">
                          <div>
                            <div 
                              className={cn(
                                "font-semibold",
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {transaction.type === 'income' ? '+ ' : '- '}
                              {formatCurrencyForHistory(Math.abs(transaction.amount))}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.time}</div>
                          </div>
                          {isEditMode && (
                            <TransactionRowActions
                              transaction={transaction}
                              openEditTransactionDialog={openEditTransactionDialog}
                              setTransactionToDelete={setTransactionToDelete}
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      {transactionToDelete && (
        <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className={buttonVariants({variant: "destructive"})}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}

// Need to import useLayoutActions
import { useLayoutActions } from '@/contexts/LayoutActionsContext';
