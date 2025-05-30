
"use client";

import React, { useState } from 'react'; // Added useState
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Transaction } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListCollapse, MoreVertical, Edit3, Trash2 } from 'lucide-react'; // Added MoreVertical, Edit3, Trash2
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale'; // Added Indonesian locale for date formatting
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useLayoutActions } from '@/contexts/LayoutActionsContext';
import { buttonVariants } from "@/components/ui/button";

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatDateForDisplay = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, 'EEEE, dd MMMM yyyy', { locale: idLocale });
  } catch (error) {
    console.error("Error parsing date for display:", dateString, error);
    return dateString;
  }
};

interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

export function TransactionHistoryTable({ transactions }: TransactionHistoryTableProps) {
  const { deleteTransaction } = useTransactions();
  const { openEditTransactionDialog } = useLayoutActions();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isEditMode, setIsEditMode] = useState(false); // State for edit mode

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  const displayedTransactions = transactions; // Assuming all transactions are displayed if not limited

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ListCollapse className="h-5 w-5 mr-2 text-primary" />
              <CardTitle>Transaksi Terkini</CardTitle>
            </div>
            {/* "Ubah" text placeholder if needed when no transactions, though typically not shown */}
          </div>
          <CardDescription className="mt-1">Belum ada transaksi yang dicatat.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <p className="text-muted-foreground">Tambah transaksi untuk melihat riwayat Anda.</p>
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
        <CardDescription className="mt-1">Catatan aktivitas keuangan terakhir Anda.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-0 md:p-0">
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
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.time}</div>
                          </div>
                          {isEditMode && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Opsi</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditTransactionDialog(transaction)}>
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Ubah
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTransactionToDelete(transaction)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
