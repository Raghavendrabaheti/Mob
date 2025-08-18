import { useMemo } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart3, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { getCategoryEmoji } from '@/lib/categoryEmojis';
import { getCategoryStatus } from '@/lib/categoryStatus';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--expense))', 'hsl(var(--income))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--success))'];

export const Analytics = () => {
  const { state, getTotalIncome, getTotalExpense } = useApp();

  // Category-wise spending data for pie chart
  const categoryData = useMemo(() => {
    const expenses = state.transactions.filter(t => t.type === 'expense');
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        emoji: getCategoryEmoji(category)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [state.transactions]);

  // Monthly trend data for line chart
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const monthTransactions = state.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM'),
        income,
        expense,
        net: income - expense
      };
    });
  }, [state.transactions]);

  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics
        </h1>
        <p className="text-muted-foreground">Your spending insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-income" />
            <p className="text-xs text-muted-foreground">Total Income</p>
            <p className="text-lg font-bold text-income">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-expense" />
            <p className="text-xs text-muted-foreground">Total Expense</p>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-lg font-bold">{savingsRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <>
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {categoryData.map((category, index) => {
                  const categoryStatus = getCategoryStatus(category.name, state.categoryLimits, state.transactions);
                  return (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-lg">{category.emoji}</span>
                        <span className={`text-sm font-medium ${categoryStatus.isOverLimit ? 'text-red-700' : ''}`}>
                          {category.name}
                        </span>
                        {categoryStatus.isOverLimit && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency(category.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--income))"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="hsl(var(--expense))"
                  strokeWidth={2}
                  name="Expense"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryData.length > 0 && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <p className="text-sm">
                <strong>Top spending category:</strong> {categoryData[0].emoji} {categoryData[0].name}
                ({formatCurrency(categoryData[0].value)})
              </p>
            </div>
          )}

          <div className="p-3 bg-accent/50 rounded-lg">
            <p className="text-sm">
              <strong>Average daily expense:</strong> {formatCurrency(totalExpense / 30)}
            </p>
          </div>

          {/* Category limit warnings */}
          {(() => {
            const categoriesOverLimit = categoryData
              .map(cat => ({
                ...cat,
                status: getCategoryStatus(cat.name, state.categoryLimits, state.transactions)
              }))
              .filter(cat => cat.status.isOverLimit);

            if (categoriesOverLimit.length > 0) {
              return (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-medium text-red-700">
                      Categories Over Limit
                    </p>
                  </div>
                  {categoriesOverLimit.map(cat => (
                    <p key={cat.name} className="text-sm text-red-600">
                      • {cat.emoji} {cat.name}: {formatCurrency(cat.value)}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {savingsRate > 0 && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <p className="text-sm">
                <strong>Great job!</strong> You're saving {savingsRate.toFixed(1)}% of your income
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};