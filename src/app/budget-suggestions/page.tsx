
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTransactions } from '@/contexts/TransactionContext';
import type { SuggestBudgetsInput, SuggestBudgetsOutput } from '@/ai/flows/suggest-budgets';
import { suggestBudgets } from '@/ai/flows/suggest-budgets';
import { Lightbulb, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function BudgetSuggestionsPage() {
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const [suggestions, setSuggestions] = useState<SuggestBudgetsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSuggestBudgets = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    if (transactions.length === 0) {
      setError("Tidak ada riwayat transaksi untuk menyarankan anggaran. Harap tambahkan beberapa transaksi terlebih dahulu.");
      setIsLoading(false);
      toast({
        title: "Tidak Ada Transaksi",
        description: "Tambahkan beberapa transaksi untuk mendapatkan saran anggaran.",
        variant: "destructive",
      });
      return;
    }
    
    const expenseTransactionsForAI = transactions
      .filter(t => t.type === 'expense')
      .map(t => ({ category: t.category, amount: t.amount }));

    if (expenseTransactionsForAI.length === 0) {
      setError("Tidak ada riwayat transaksi pengeluaran untuk menyarankan anggaran. Harap tambahkan beberapa pengeluaran terlebih dahulu.");
      setIsLoading(false);
       toast({
        title: "Tidak Ada Pengeluaran",
        description: "Tambahkan transaksi pengeluaran untuk mendapatkan saran anggaran.",
        variant: "destructive",
      });
      return;
    }

    const input: SuggestBudgetsInput = {
      historicalTransactions: JSON.stringify(expenseTransactionsForAI),
    };

    try {
      const result = await suggestBudgets(input);
      if (Object.keys(result).length === 0) {
        setError("AI tidak dapat menghasilkan saran anggaran saat ini. Ini mungkin karena data terbatas atau masalah sementara.");
         toast({
          title: "Saran Gagal",
          description: "AI tidak dapat menghasilkan saran. Coba lagi nanti atau tambahkan transaksi yang lebih beragam.",
          variant: "destructive",
        });
      } else {
        setSuggestions(result);
        toast({
          title: "Anggaran Disarankan!",
          description: "AI telah menghasilkan saran anggaran untuk Anda.",
        });
      }
    } catch (e) {
      console.error("Error suggesting budgets:", e);
      setError("Gagal mendapatkan saran anggaran. Silakan coba lagi nanti.");
      toast({
        title: "Kesalahan",
        description: "Terjadi kesalahan tak terduga saat mengambil saran anggaran.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isClient || transactionsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-primary" />
            Saran Anggaran AI
          </CardTitle>
          {/* <CardDescription>
            Biarkan alat cerdas kami menganalisis kebiasaan belanja Anda dan menyarankan anggaran yang dipersonalisasi untuk Anda.
            Ini bekerja paling baik dengan jumlah data pengeluaran historis yang wajar.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button onClick={handleSuggestBudgets} disabled={isLoading || transactionsLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghasilkan...
              </>
            ) : (
              'Sarankan Anggaran Saya'
            )}
          </Button>
          {transactions.length === 0 && !transactionsLoading && (
             <p className="text-sm text-muted-foreground">
                Tambahkan beberapa transaksi terlebih dahulu untuk mengaktifkan saran anggaran.
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {suggestions && Object.keys(suggestions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saran Anggaran Bulanan</CardTitle>
            {/* <CardDescription>Berdasarkan riwayat pengeluaran Anda, berikut adalah beberapa jumlah bulanan yang disarankan untuk kategori pengeluaran Anda.</CardDescription> */}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah yang Disarankan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(suggestions).map(([category, amount]) => (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
       {suggestions && Object.keys(suggestions).length === 0 && !error && !isLoading && (
         <Card>
            <CardHeader>
                <CardTitle>Tidak Ada Saran Dihasilkan</CardTitle>
                {/* <CardDescription>AI tidak dapat menghasilkan saran anggaran dengan data saat ini.</CardDescription> */}
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Coba tambahkan transaksi pengeluaran yang lebih beragam atau coba lagi nanti.</p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}
