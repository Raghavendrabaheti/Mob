import { useState, useMemo } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Trash2 } from 'lucide-react';
import { getCategoryEmoji } from '@/lib/categoryEmojis';
import { getCategoryStatus } from '@/lib/categoryStatus';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const Transactions = () => {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    state.transactions.forEach(t => {
      const date = new Date(t.date);
      monthSet.add(format(date, 'yyyy-MM'));
    });
    return Array.from(monthSet).sort().reverse();
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    return state.transactions.filter(transaction => {
      const searchMatch =
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(search.toLowerCase()) ||
        transaction.amount.toString().includes(search);

      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;

      const monthMatch = monthFilter === 'all' ||
        format(new Date(transaction.date), 'yyyy-MM') === monthFilter;

      return searchMatch && typeMatch && monthMatch;
    });
  }, [state.transactions, search, typeFilter, monthFilter]);

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Showing {filteredTransactions.length} transactions
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-income">Income</p>
                <p className="font-semibold">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-expense">Expense</p>
                <p className="font-semibold">
                  {formatCurrency(
                    filteredTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => {
            const categoryStatus = transaction.type === 'expense'
              ? getCategoryStatus(transaction.category, state.categoryLimits, state.transactions)
              : { hasLimit: false, isOverLimit: false };

            return (
              <Card key={transaction.id} className={cn(
                categoryStatus.isOverLimit && "border-red-500 bg-red-50"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 bg-accent rounded-full flex items-center justify-center relative",
                        categoryStatus.isOverLimit && "bg-red-100"
                      )}>
                        <span className={cn(
                          "text-lg",
                          categoryStatus.isOverLimit && "filter brightness-75 saturate-150"
                        )}>
                          {getCategoryEmoji(transaction.category)}
                        </span>
                        {categoryStatus.isOverLimit && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-medium",
                            categoryStatus.isOverLimit && "text-red-700"
                          )}>
                            {transaction.category}
                          </h3>
                          <Badge
                            variant={transaction.type === 'income' ? 'default' : 'secondary'}
                            className={cn(
                              transaction.type === 'income'
                                ? 'bg-income text-income-foreground'
                                : 'bg-expense text-expense-foreground'
                            )}
                          >
                            {transaction.type}
                          </Badge>
                        </div>

                        <p className={cn(
                          "text-sm text-muted-foreground",
                          categoryStatus.isOverLimit && "text-red-600"
                        )}>
                          {format(new Date(transaction.date), 'MMM dd, yyyy • h:mm a')}
                        </p>

                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-semibold",
                        transaction.type === 'income' ? 'text-income' : 'text-expense'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="mt-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};