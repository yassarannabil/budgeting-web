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
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/contexts/TransactionContext';
import type { Transaction, TransactionType, Category } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: "Transaction type is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  category: z.string().min(1, { message: "Category is required." }),
  note: z.string().optional(),
  date: z.date({ required_error: "Date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)." }),
});

type TransactionFormData = z.infer<typeof formSchema>;

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { addTransaction } = useTransactions();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');
  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      const now = new Date();
      setCurrentDate(now);
      setCurrentTime(format(now, 'HH:mm'));
    }
  }, [open]);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      note: '',
    },
  });

 useEffect(() => {
    if (open && currentDate && currentTime) {
      form.reset({
        type: 'expense',
        amount: 0,
        category: '',
        note: '',
        date: currentDate,
        time: currentTime,
      });
      setSelectedType('expense');
    }
  }, [open, currentDate, currentTime, form]);


  const onSubmit = (data: TransactionFormData) => {
    const transactionData: Omit<Transaction, 'id'> = {
      ...data,
      category: data.category as Category,
      date: format(data.date, 'yyyy-MM-dd'),
    };
    addTransaction(transactionData);
    toast({
      title: "Transaction Saved",
      description: `${data.type === 'income' ? 'Income' : 'Expense'} of $${data.amount} for ${data.category} added.`,
    });
    onOpenChange(false);
    form.reset();
  };

  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!open) return null; // Render nothing if not open, or handle initial values differently

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Fill in the details of your transaction below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value as TransactionType);
                    setSelectedType(value as TransactionType);
                    form.setValue('category', ''); // Reset category on type change
                  }}
                  value={field.value}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Income</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Expense</Label>
                  </div>
                </RadioGroup>
              )}
            />
             {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount')} placeholder="e.g., 50.00" />
            {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            <Label htmlFor="date">Date</Label>
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
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" {...form.register('time')} />
            {form.formState.errors.time && <p className="text-sm text-destructive mt-1">{form.formState.errors.time.message}</p>}
          </div>

          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea id="note" {...form.register('note')} placeholder="e.g., Lunch with client" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
