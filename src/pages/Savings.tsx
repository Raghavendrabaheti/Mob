import { useState } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PiggyBank, Plus, Trash2, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Savings = () => {
  const { state, dispatch, getTotalSavings } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const handleAddSaving = () => {
    if (!title.trim() || !targetAmount) {
      toast({
        title: "Missing fields",
        description: "Please enter both title and target amount",
        variant: "destructive"
      });
      return;
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    const newSaving = {
      id: Date.now().toString(),
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: 0
    };

    dispatch({ type: 'ADD_SAVING', payload: newSaving });
    toast({
      title: "Saving goal created",
      description: `Target: ₹${targetNum.toLocaleString()} for ${title}`
    });

    setTitle('');
    setTargetAmount('');
    setShowAddDialog(false);
  };

  const handleAddToSaving = (id: string) => {
    const amountNum = parseFloat(addAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    dispatch({ type: 'ADD_TO_SAVING', payload: { id, amount: amountNum } });
    toast({
      title: "Added to savings",
      description: `₹${amountNum.toLocaleString()} added successfully`
    });
    setAddAmount('');
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const totalSaved = getTotalSavings();
  const totalTarget = state.savings.reduce((sum, s) => sum + s.targetAmount, 0);

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PiggyBank className="w-6 h-6" />
            Savings Goals
          </h1>
          <p className="text-muted-foreground">Track your saving progress</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Goal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Saving Goal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input id="title" placeholder="e.g., New Laptop" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target Amount (₹)</Label>
                <Input id="target" type="number" placeholder="0.00" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
              </div>
              <Button onClick={handleAddSaving} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-saving text-saving-foreground">
        <CardContent className="p-6 text-center">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">{formatCurrency(totalSaved)}</h2>
          <p className="opacity-90">Total Saved</p>
          <p className="text-sm opacity-75 mt-1">
            {totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(1)}% of target` : 'No targets set'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {state.savings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No Savings Goals Yet</h3>
              <p className="text-muted-foreground mb-4">Set goals for things you want to save for</p>
              <Button onClick={() => setShowAddDialog(true)}>Create Your First Goal</Button>
            </CardContent>
          </Card>
        ) : (
          state.savings.map((saving) => {
            const percentage = (saving.currentAmount / saving.targetAmount) * 100;
            return (
              <Card key={saving.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{saving.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(saving.currentAmount)} of {formatCurrency(saving.targetAmount)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'DELETE_SAVING', payload: saving.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Progress value={percentage} className="mb-4" />
                  <div className="flex gap-2">
                    <Input placeholder="Add amount" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} type="number" className="flex-1" />
                    <Button onClick={() => handleAddToSaving(saving.id)}>Add</Button>
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