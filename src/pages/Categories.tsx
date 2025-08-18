import { useState } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, X, Tag, Settings, DollarSign } from 'lucide-react';
import { getCategoryEmoji } from '@/lib/categoryEmojis';
import { toast } from '@/hooks/use-toast';

export const Categories = () => {
  const { state, dispatch } = useApp();
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const addCategory = (type: 'income' | 'expense', category: string) => {
    const trimmed = category.trim();

    if (!trimmed) {
      toast({
        title: "Empty category",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    const existingCategories = state.categories[type];
    const exists = existingCategories.some(
      c => c.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      toast({
        title: "Category exists",
        description: "This category already exists",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'ADD_CATEGORY',
      payload: { type, category: trimmed }
    });

    toast({
      title: "Category added",
      description: `${trimmed} added to ${type} categories`
    });

    // Clear input
    if (type === 'income') {
      setNewIncomeCategory('');
    } else {
      setNewExpenseCategory('');
    }
  };

  const removeCategory = (type: 'income' | 'expense', category: string) => {
    // Check if category is being used in transactions
    const isUsed = state.transactions.some(t =>
      t.type === type && t.category === category
    );

    if (isUsed) {
      toast({
        title: "Cannot delete",
        description: "This category is used in existing transactions",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'DELETE_CATEGORY',
      payload: { type, category }
    });

    // Also remove any limits for this category
    dispatch({
      type: 'DELETE_CATEGORY_LIMIT',
      payload: category
    });

    toast({
      title: "Category removed",
      description: `${category} removed from ${type} categories`
    });
  };

  const openLimitDialog = (category: string) => {
    const existingLimit = state.categoryLimits.find(l => l.category === category);
    setSelectedCategory(category);
    setDailyLimit(existingLimit?.dailyLimit?.toString() || '');
    setMonthlyLimit(existingLimit?.monthlyLimit?.toString() || '');
    setLimitDialogOpen(true);
  };

  const saveCategoryLimit = () => {
    const dailyValue = dailyLimit ? parseFloat(dailyLimit) : undefined;
    const monthlyValue = monthlyLimit ? parseFloat(monthlyLimit) : undefined;

    if (dailyValue && (isNaN(dailyValue) || dailyValue <= 0)) {
      toast({
        title: "Invalid daily limit",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    if (monthlyValue && (isNaN(monthlyValue) || monthlyValue <= 0)) {
      toast({
        title: "Invalid monthly limit",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    if (!dailyValue && !monthlyValue) {
      // Remove limit if both are empty
      dispatch({
        type: 'DELETE_CATEGORY_LIMIT',
        payload: selectedCategory
      });
      toast({
        title: "Limit removed",
        description: `Spending limits removed for ${selectedCategory}`
      });
    } else {
      dispatch({
        type: 'SET_CATEGORY_LIMIT',
        payload: {
          category: selectedCategory,
          dailyLimit: dailyValue,
          monthlyLimit: monthlyValue
        }
      });
      toast({
        title: "Limit set",
        description: `Spending limits updated for ${selectedCategory}`
      });
    }

    setLimitDialogOpen(false);
    setSelectedCategory('');
    setDailyLimit('');
    setMonthlyLimit('');
  };

  const CategoryList = ({
    type,
    categories,
    newCategory,
    setNewCategory
  }: {
    type: 'income' | 'expense';
    categories: string[];
    newCategory: string;
    setNewCategory: (value: string) => void;
  }) => (
    <div className="space-y-4">
      {/* Add new category */}
      <div className="flex gap-2">
        <Input
          placeholder={`Add new ${type} category...`}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addCategory(type, newCategory);
            }
          }}
        />
        <Button onClick={() => addCategory(type, newCategory)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories grid */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isUsed = state.transactions.some(t =>
            t.type === type && t.category === category
          );
          const hasLimit = state.categoryLimits.some(l => l.category === category);

          return (
            <Badge
              key={category}
              variant="secondary"
              className="text-sm px-3 py-1 flex items-center gap-2"
            >
              <span>{getCategoryEmoji(category)}</span>
              <span>{category}</span>
              {hasLimit && (
                <DollarSign className="w-3 h-3 text-green-600" />
              )}
              {type === 'expense' && (
                <button
                  onClick={() => openLimitDialog(category)}
                  className="ml-1 hover:text-blue-600"
                  title="Set spending limits"
                >
                  <Settings className="w-3 h-3" />
                </button>
              )}
              {!isUsed && (
                <button
                  onClick={() => removeCategory(type, category)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No {type} categories yet</p>
          <p className="text-sm">Add one above to get started</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag className="w-6 h-6" />
          Manage Categories
        </h1>
        <p className="text-muted-foreground">
          Customize your income and expense categories
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="text-expense">
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="text-income">
                Income
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="mt-4">
              <CategoryList
                type="expense"
                categories={state.categories.expense}
                newCategory={newExpenseCategory}
                setNewCategory={setNewExpenseCategory}
              />
            </TabsContent>

            <TabsContent value="income" className="mt-4">
              <CategoryList
                type="income"
                categories={state.categories.income}
                newCategory={newIncomeCategory}
                setNewCategory={setNewIncomeCategory}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Categories with existing transactions cannot be deleted</p>
          <p>• Use specific categories for better expense tracking</p>
          <p>• Common student categories: Food, Books, Transport, Entertainment</p>
          <p>• Income categories: Allowance, Part-time Job, Scholarship</p>
        </CardContent>
      </Card>

      {/* Limit Setting Dialog */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Spending Limits for {selectedCategory}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dailyLimit">Daily Limit (₹)</Label>
              <Input
                id="dailyLimit"
                type="number"
                placeholder="e.g., 500"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monthlyLimit">Monthly Limit (₹)</Label>
              <Input
                id="monthlyLimit"
                type="number"
                placeholder="e.g., 10000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>• Leave blank to remove limits</p>
              <p>• You'll get warnings when approaching limits</p>
              <p>• Categories with limits show a ₹ icon</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setLimitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCategoryLimit}>
                Save Limits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};