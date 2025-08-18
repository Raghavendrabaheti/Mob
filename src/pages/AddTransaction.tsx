import { useState } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getCategoryEmoji } from '@/lib/categoryEmojis';

export const AddTransaction = () => {
  const { state, dispatch, checkCategoryLimit } = useApp();
  const navigate = useNavigate();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

  const categories = type === 'income' ? state.categories.income : state.categories.expense;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in amount and category",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      type,
      category,
      amount: amountNum,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined
    };

    // Check limits for expense transactions
    if (type === 'expense') {
      const { dailyExceeded, monthlyExceeded } = checkCategoryLimit(category, amountNum);

      if (dailyExceeded || monthlyExceeded) {
        setPendingTransaction(transaction);
        setShowLimitWarning(true);
        return;
      }
    }

    // If no limits exceeded or income transaction, proceed directly
    processTransaction(transaction);
  };

  const processTransaction = (transaction: any) => {
    setLoading(true);

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

    toast({
      title: "Transaction added!",
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of ₹${transaction.amount.toLocaleString()} recorded`
    });

    // Reset form
    setAmount('');
    setCategory('');
    setNotes('');
    setLoading(false);

    // Navigate to transactions page
    navigate('/app/transactions');
  };

  const proceedWithWarning = () => {
    if (pendingTransaction) {
      processTransaction(pendingTransaction);
    }
    setShowLimitWarning(false);
    setPendingTransaction(null);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Transaction</h1>
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/categories">
            <Settings className="w-4 h-4 mr-2" />
            Manage Categories
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Transaction
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-3">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(value: 'income' | 'expense') => {
                  setType(value);
                  setCategory(''); // Reset category when type changes
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income" className="text-income font-medium">
                    Income
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense" className="text-expense font-medium">
                    Expense
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
                className="text-lg"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <span>{getCategoryEmoji(cat)}</span>
                        <span>{cat}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add a note about this transaction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Limit Warning Dialog */}
      <AlertDialog open={showLimitWarning} onOpenChange={setShowLimitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Spending Limit Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingTransaction && (() => {
                const { dailyExceeded, monthlyExceeded } = checkCategoryLimit(
                  pendingTransaction.category,
                  pendingTransaction.amount
                );
                return (
                  <div className="space-y-2">
                    <p>This expense will exceed your set limits for <strong>{pendingTransaction.category}</strong>:</p>
                    {dailyExceeded && (
                      <p className="text-orange-600">• Daily limit exceeded</p>
                    )}
                    {monthlyExceeded && (
                      <p className="text-orange-600">• Monthly limit exceeded</p>
                    )}
                    <p className="mt-3">Do you want to proceed anyway?</p>
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowLimitWarning(false);
              setPendingTransaction(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithWarning}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};