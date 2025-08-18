export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // ISO
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[];
  budget?: number;
  notes?: string;
}

export interface Lockup {
  id: string;
  title: string;
  amount: number;     // initial locked
  balance: number;    // remaining
}

export interface Saving {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CategoryLimit {
  category: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface AppState {
  user: User | null;
  transactions: Transaction[];
  events: Event[];
  lockups: Lockup[];
  savings: Saving[];
  categories: {
    income: string[];
    expense: string[];
  };
  categoryLimits: CategoryLimit[];
  theme: 'light' | 'dark';
}