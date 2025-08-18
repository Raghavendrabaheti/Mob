import { useState } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Lock, Plus, Trash2, AlertTriangle, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Lockups = () => {
  const { state, dispatch, getTotalLockups } = useApp();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSpendDialog, setShowSpendDialog] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');

  const resetForm = () => {
    setTitle('');
    setAmount('');
  };

  const handleAddLockup = () => {
    if (!title.trim() || !amount) {
      toast({
        title: "Missing fields",
        description: "Please enter both title and amount",
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

    const newLockup = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: amountNum,
      balance: amountNum
    };

    dispatch({ type: 'ADD_LOCKUP', payload: newLockup });
    
    toast({
      title: "Lockup created",
      description: `₹${amountNum.toLocaleString()} locked for ${title}`
    });

    resetForm();
    setShowAddDialog(false);
  };

  const handleDeleteLockup = (id: string) => {
    dispatch({ type: 'DELETE_LOCKUP', payload: id });
    toast({
      title: "Lockup deleted",
      description: "Lockup removed successfully"
    });
  };

  const handleSpend = (id: string, isEmergency: boolean = false) => {
    if (!spendAmount) {
      toast({
        title: "Missing amount",
        description: "Please enter the amount to spend",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(spendAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    const lockup = state.lockups.find(l => l.id === id);
    if (!lockup) return;

    if (amountNum > lockup.balance) {
      toast({
        title: "Insufficient balance",
        description: "Cannot spend more than the locked amount",
        variant: "destructive"
      });
      return;
    }

    dispatch({ 
      type: 'SPEND_FROM_LOCKUP', 
      payload: { id, amount: amountNum } 
    });

    // Also add as expense transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'expense' as const,
      category: 'Other',
      amount: amountNum,
      date: new Date().toISOString(),
      notes: `Spent from lockup: ${lockup.title}${isEmergency ? ' (Emergency)' : ''}`
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    
    toast({
      title: isEmergency ? "Emergency spending completed" : "Amount spent",
      description: `₹${amountNum.toLocaleString()} spent from ${lockup.title}`
    });

    setSpendAmount('');
    setShowSpendDialog(null);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const totalLocked = getTotalLockups();

  // Confirmation questions for spending
  const confirmationQuestions = [
    "Are you sure you need to spend this locked money?",
    "Have you considered all other options?",
    "Is this expense absolutely necessary?",
    "Can this purchase wait until your next income?"
  ];

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Lockups
          </h1>
          <p className="text-muted-foreground">Lock money for important expenses</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lockup
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Lockup</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Lockup Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Semester Fee, Emergency Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Lock (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <Button onClick={handleAddLockup} className="w-full">
                Create Lockup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card className="bg-lockup text-lockup-foreground">
        <CardContent className="p-6 text-center">
          <Lock className="w-8 h-8 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">{formatCurrency(totalLocked)}</h2>
          <p className="opacity-90">Total Locked Amount</p>
          <p className="text-sm opacity-75 mt-1">
            {state.lockups.length} active lockup{state.lockups.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Lockups List */}
      <div className="space-y-3">
        {state.lockups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No Lockups Yet</h3>
              <p className="text-muted-foreground mb-4">
                Lock money for important expenses like fees, rent, or emergency funds
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                Create Your First Lockup
              </Button>
            </CardContent>
          </Card>
        ) : (
          state.lockups.map((lockup) => {
            const percentage = (lockup.balance / lockup.amount) * 100;
            const spent = lockup.amount - lockup.balance;
            
            return (
              <Card key={lockup.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{lockup.title}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(lockup.balance)} of {formatCurrency(lockup.amount)}
                        </span>
                        <span className="text-xs bg-accent px-2 py-1 rounded">
                          {percentage.toFixed(0)}% remaining
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLockup(lockup.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Progress value={percentage} className="mb-4" />
                  
                  {spent > 0 && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Spent: {formatCurrency(spent)}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" disabled={lockup.balance === 0}>
                          Spend
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Spend from {lockup.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-accent rounded-lg">
                            <p className="text-sm text-muted-foreground">Available Balance</p>
                            <p className="text-xl font-bold">{formatCurrency(lockup.balance)}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="spendAmount">Amount to Spend (₹)</Label>
                            <Input
                              id="spendAmount"
                              type="number"
                              placeholder="0.00"
                              value={spendAmount}
                              onChange={(e) => setSpendAmount(e.target.value)}
                              min="0"
                              max={lockup.balance}
                              step="0.01"
                            />
                          </div>
                          
                          {/* Confirmation Questions */}
                          <div className="space-y-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                            <div className="flex items-center gap-2 text-warning">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="font-medium">Think before you spend</span>
                            </div>
                            <div className="space-y-2">
                              {confirmationQuestions.map((question, index) => (
                                <p key={index} className="text-sm text-muted-foreground">
                                  • {question}
                                </p>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleSpend(lockup.id, false)}
                            >
                              I'm Sure
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleSpend(lockup.id, true)}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Emergency
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Lockup Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Lock money for essential expenses like fees, rent, or emergencies</p>
          <p>• Think twice before spending - use the confirmation process</p>
          <p>• Emergency button bypasses confirmations for true emergencies</p>
          <p>• Lockups help you avoid impulsive spending on important funds</p>
        </CardContent>
      </Card>
    </div>
  );
};