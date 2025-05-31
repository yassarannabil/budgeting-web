
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  // DialogDescription, // Removed
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/contexts/TransactionContext';
import type { Transaction, TransactionType, Category } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean, details?: { transaction?: Transaction | null; operationMode?: 'add' | 'edit' }) => void;
  transactionToEdit?: Transaction | null;
  mode?: 'add' | 'edit';
}

const formSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: "Jenis transaksi harus diisi." }),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
  category: z.string().min(1, { message: "Kategori harus diisi." }),
  note: z.string().optional(),
  date: z.date({ required_error: "Tanggal harus diisi." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Format waktu tidak valid (JJ:MM)." }),
});

type TransactionFormData = z.infer<typeof formSchema>;

const formatCurrency = (amount: number) => {
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


export function TransactionDialog({ open, onOpenChange, transactionToEdit, mode = 'add' }: TransactionDialogProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<TransactionType>(transactionToEdit?.type || 'expense');
  
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category: '',
      note: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
    },
  });

 useEffect(() => {
    if (open) {
      if (mode === 'edit' && transactionToEdit) {
        const transactionDate = parse(transactionToEdit.date, 'yyyy-MM-dd', new Date());
        form.reset({
          type: transactionToEdit.type,
          amount: transactionToEdit.amount,
          category: transactionToEdit.category,
          note: transactionToEdit.note || '',
          date: isValid(transactionDate) ? transactionDate : new Date(),
          time: transactionToEdit.time,
        });
        setSelectedType(transactionToEdit.type);
      } else {
        const now = new Date();
        form.reset({
          type: 'expense',
          amount: 0,
          category: '',
          note: '',
          date: now,
          time: format(now, 'HH:mm'),
        });
        setSelectedType('expense');
      }
    }
  }, [open, mode, transactionToEdit, form]);


  const onSubmit = (data: TransactionFormData) => {
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    const transactionData: Omit<Transaction, 'id'> & { id?: string } = {
      ...data,
      category: data.category as Category,
      date: formattedDate,
    };

    let savedTransaction: Transaction | null = null;

    if (mode === 'edit' && transactionToEdit) {
      const updatedTx = { ...transactionData, id: transactionToEdit.id } as Transaction;
      updateTransaction(updatedTx);
      savedTransaction = updatedTx;
      toast({
        title: "Transaksi Diperbarui",
        description: `${data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatCurrency(data.amount)} untuk ${data.category} telah diperbarui.`,
      });
    } else {
      const newTx = { ...transactionData, id: crypto.randomUUID() } as Transaction;
      addTransaction(newTx);
      savedTransaction = newTx;
      toast({
        title: "Transaksi Disimpan",
        description: `${data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} sebesar ${formatCurrency(data.amount)} untuk ${data.category} telah ditambahkan.`,
      });
    }
    onOpenChange(false, {transaction: savedTransaction, operationMode: mode});
  };

  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => onOpenChange(isOpen)}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Ubah Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
          {/* <DialogDescription>
            {mode === 'edit' ? 'Perbarui detail transaksi Anda di bawah ini.' : 'Isi detail transaksi Anda di bawah ini.'}
          </DialogDescription> */}
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2"> {/* Added pt-2 to compensate for removed description */}
          <div>
            <Label htmlFor="type">Jenis</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value as TransactionType);
                    setSelectedType(value as TransactionType);
                    form.setValue('category', ''); 
                  }}
                  value={field.value}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Pemasukan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Pengeluaran</Label>
                  </div>
                </RadioGroup>
              )}
            />
             {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Jumlah</Label>
            <Input id="amount" type="number" step="1" {...form.register('amount')} placeholder="Contoh: 50000" />
            {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Controller
              control={form.control}
              name="date"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP", { locale: idLocale }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={idLocale}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="time">Waktu</Label>
            <Input id="time" type="time" {...form.register('time')} />
            {form.formState.errors.time && <p className="text-sm text-destructive mt-1">{form.formState.errors.time.message}</p>}
          </div>

          <div>
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <Textarea id="note" {...form.register('note')} placeholder="Contoh: Makan siang dengan klien" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (mode === 'edit' ? 'Memperbarui...' : 'Menyimpan...') : (mode === 'edit' ? 'Perbarui Transaksi' : 'Simpan Transaksi')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
