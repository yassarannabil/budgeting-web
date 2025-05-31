
// src/ai/flows/suggest-budgets.ts
'use server';

/**
 * @fileOverview Provides budget suggestions based on user's historical transaction data.
 *
 * - suggestBudgets - A function that generates budget suggestions.
 * - SuggestBudgetsInput - The input type for the suggestBudgets function.
 * - SuggestBudgetsOutput - The return type for the suggestBudgets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetsInputSchema = z.object({
  historicalTransactions: z.string().describe('A JSON string containing historical transaction data. Each transaction should have a category and amount field.'),
});
export type SuggestBudgetsInput = z.infer<typeof SuggestBudgetsInputSchema>;

const SuggestBudgetsOutputSchema = z.record(z.string(), z.number()).describe('A JSON object where keys are spending categories and values are the suggested budget amounts for each category.');
export type SuggestBudgetsOutput = z.infer<typeof SuggestBudgetsOutputSchema>;

export async function suggestBudgets(input: SuggestBudgetsInput): Promise<SuggestBudgetsOutput> {
  return suggestBudgetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetsPrompt',
  input: {schema: SuggestBudgetsInputSchema},
  output: {schema: SuggestBudgetsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's historical spending data and suggest reasonable monthly budget amounts for each category. The categories provided in the historical data are in English. Your output keys (categories) should also be in English, matching the input categories.

  Historical Transactions (JSON string):
  {{historicalTransactions}}

  Provide the output as a JSON object where keys are spending categories (in English) and values are the suggested budget amounts for each category. Do not include any text other than the JSON object. Ensure the category names in the output JSON exactly match the English category names from the input if possible.
  `,
});

const suggestBudgetsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetsFlow',
    inputSchema: SuggestBudgetsInputSchema,
    outputSchema: SuggestBudgetsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from prompt');
      }
      return output;
    } catch (e) {
      console.error('Error in suggestBudgetsFlow', e);
      return {};
    }
  }
);
