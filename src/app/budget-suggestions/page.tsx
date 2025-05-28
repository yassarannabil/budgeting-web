"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/contexts/TransactionContext';
import type { SuggestBudgetsInput, SuggestBudgetsOutput } from '@/ai/flows/suggest-budgets';
import { suggestBudgets } from '@/ai/flows/suggest-budgets'; // Make sure path is correct
import { Lightbulb, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
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
      setError("No transaction history available to suggest budgets. Please add some transactions first.");
      setIsLoading(false);
      toast({
        title: "No Transactions",
        description: "Add some transactions to get budget suggestions.",
        variant: "destructive",
      });
      return;
    }
    
    // Filter for expenses and simplify data for the AI
    const expenseTransactionsForAI = transactions
      .filter(t => t.type === 'expense')
      .map(t => ({ category: t.category, amount: t.amount }));

    if (expenseTransactionsForAI.length === 0) {
      setError("No expense transaction history available to suggest budgets. Please add some expenses first.");
      setIsLoading(false);
       toast({
        title: "No Expenses",
        description: "Add expense transactions to get budget suggestions.",
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
        setError("The AI couldn't generate budget suggestions at this time. This might be due to limited data or a temporary issue.");
         toast({
          title: "Suggestion Failed",
          description: "AI could not generate suggestions. Try again later or add more diverse transactions.",
          variant: "destructive",
        });
      } else {
        setSuggestions(result);
        toast({
          title: "Budgets Suggested!",
          description: "AI has generated budget suggestions for you.",
        });
      }
    } catch (e) {
      console.error("Error suggesting budgets:", e);
      setError("Failed to get budget suggestions. Please try again later.");
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching budget suggestions.",
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
            AI Budget Suggestions
          </CardTitle>
          <CardDescription>
            Let our intelligent tool analyze your spending habits and suggest personalized budgets for you.
            This works best with a reasonable amount of historical expense data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Button onClick={handleSuggestBudgets} disabled={isLoading || transactionsLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Suggest My Budgets'
            )}
          </Button>
          {transactions.length === 0 && !transactionsLoading && (
             <p className="text-sm text-muted-foreground">
                Add some transactions first to enable budget suggestions.
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
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
            <CardTitle>Suggested Monthly Budgets</CardTitle>
            <CardDescription>Based on your spending history, here are some suggested monthly amounts for your expense categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Suggested Amount</TableHead>
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
          </CardContent>
        </Card>
      )}
       {suggestions && Object.keys(suggestions).length === 0 && !error && !isLoading && (
         <Card>
            <CardHeader>
                <CardTitle>No Suggestions Generated</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The AI could not generate budget suggestions with the current data. Try adding more diverse expense transactions or try again later.</p>
            </CardContent>
         </Card>
       )}
    </div>
  );
}
