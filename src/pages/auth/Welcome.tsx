import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react';

export const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-balance/10 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* App Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src="/logo.svg" alt="MoneySmart Logo" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Student Money Tracker
          </h1>
          <p className="text-muted-foreground">
            Take control of your finances as a student
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
            <TrendingUp className="w-8 h-8 text-income" />
            <div className="text-left">
              <h3 className="font-semibold">Track Expenses</h3>
              <p className="text-sm text-muted-foreground">Monitor your spending habits</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
            <PiggyBank className="w-8 h-8 text-saving" />
            <div className="text-left">
              <h3 className="font-semibold">Save & Lock Funds</h3>
              <p className="text-sm text-muted-foreground">Set goals and lock money away</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full h-12 text-base font-semibold">
            <Link to="/auth/login">Get Started</Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-12 text-base">
            <Link to="/auth/register">Create Account</Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Designed for college students aged 18-25
        </p>
      </div>
    </div>
  );
};