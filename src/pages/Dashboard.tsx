import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wallet, TrendingUp, TrendingDown, Lock, PiggyBank, QrCode, CreditCard } from 'lucide-react';
import { getCategoryEmoji, defaultCategories } from '@/lib/categoryEmojis';
import { getCategoryStatus } from '@/lib/categoryStatus';
import { getEventSuggestions, getFrequentCategories } from '@/lib/suggestions';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const Dashboard = () => {
  const {
    state,
    getTotalBalance,
    getTotalIncome,
    getTotalExpense,
    getTotalLockups,
    getTotalSavings,
    getAvailableBalance
  } = useApp();

  const balance = getTotalBalance();
  const income = getTotalIncome();
  const expense = getTotalExpense();
  const lockups = getTotalLockups();
  const savings = getTotalSavings();
  const available = getAvailableBalance();

  const suggestions = getEventSuggestions(state.events, state.transactions);
  const frequentCategories = getFrequentCategories(state.transactions);
  const allExpenseCategories = [...defaultCategories.expense];

  const formatCurrency = (amount: number) => `₹${Math.abs(amount).toLocaleString()}`;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold">Good morning!</h1>
          <p className="text-muted-foreground">
            {state.user?.name || 'Student'}
          </p>
        </div>
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-balance text-balance-foreground">
          <CardContent className="p-4 text-center">
            <Wallet className="w-5 h-5 mx-auto mb-2" />
            <p className="text-xs opacity-90">Balance</p>
            <p className="text-lg font-bold">{formatCurrency(balance)}</p>
          </CardContent>
        </Card>

        <Card className="bg-income text-income-foreground">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2" />
            <p className="text-xs opacity-90">Income</p>
            <p className="text-lg font-bold">{formatCurrency(income)}</p>
          </CardContent>
        </Card>

        <Card className="bg-expense text-expense-foreground">
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-5 h-5 mx-auto mb-2" />
            <p className="text-xs opacity-90">Expense</p>
            <p className="text-lg font-bold">{formatCurrency(expense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Scan Button */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-4">
          <Button asChild className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <Link to="/app/scanner" className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" />
              Quick Scan & Pay
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Lockups & Savings Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-lockup" />
              <span className="text-sm font-medium">Lockups</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(lockups)}</p>
            <p className="text-xs text-muted-foreground">{state.lockups.length} active</p>
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link to="/app/lockups">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-4 h-4 text-saving" />
              <span className="text-sm font-medium">Savings</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(savings)}</p>
            <div className="mt-2">
              <Progress
                value={savings > 0 ? (savings / state.savings.reduce((sum, s) => sum + s.targetAmount, 0)) * 100 : 0}
                className="h-2"
              />
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-2">
              <Link to="/app/savings">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Balance */}
      <Card className="bg-accent">
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold mb-1">Available to Spend</h3>
          <p className="text-2xl font-bold text-primary">{formatCurrency(available)}</p>
          <p className="text-xs text-muted-foreground">
            After lockups and savings
          </p>
        </CardContent>
      </Card>

      {/* Scan & Pay */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scan & Pay
          </CardTitle>
          <CardDescription>Quick payments by category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {frequentCategories.slice(0, 6).map((category) => {
              const categoryStatus = getCategoryStatus(category, state.categoryLimits, state.transactions);
              return (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-16 flex flex-col gap-1",
                    categoryStatus.isOverLimit && "border-red-500 bg-red-50 text-red-700"
                  )}
                  asChild
                >
                  <Link to={`/app/scanner?category=${encodeURIComponent(category)}`}>
                    <span className={cn(
                      "text-lg",
                      categoryStatus.isOverLimit && "filter brightness-75 saturate-150"
                    )}>
                      {getCategoryEmoji(category)}
                    </span>
                    <span className="text-xs">{category}</span>
                    {categoryStatus.isOverLimit && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </Link>
                </Button>
              );
            })}
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/app/scanner">
              <CreditCard className="w-4 h-4 mr-2" />
              More Categories
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <div key={index} className="p-3 bg-accent/50 rounded-lg">
              <p className="text-sm">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};