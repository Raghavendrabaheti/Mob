import { AppState } from '@/types';
import { defaultCategories } from './categoryEmojis';

const STORAGE_KEY = 'student-money-tracker-v1';

export const getInitialState = (): AppState => ({
  user: null,
  transactions: [
    {
      id: '1',
      type: 'income',
      category: 'Pocket Money',
      amount: 5000,
      date: new Date().toISOString(),
      notes: 'Monthly allowance'
    },
    {
      id: '2',
      type: 'expense',
      category: 'Food',
      amount: 150,
      date: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Lunch with friends'
    },
    {
      id: '3',
      type: 'expense',
      category: 'Coffee',
      amount: 80,
      date: new Date(Date.now() - 172800000).toISOString(),
      notes: 'Morning coffee'
    },
    {
      id: '4',
      type: 'income',
      category: 'Part-time Job',
      amount: 2500,
      date: new Date(Date.now() - 259200000).toISOString(),
      notes: 'Weekend tutoring'
    },
    {
      id: '5',
      type: 'expense',
      category: 'Books',
      amount: 1200,
      date: new Date(Date.now() - 345600000).toISOString(),
      notes: 'Programming textbook'
    }
  ],
  events: [
    {
      id: '1',
      title: 'College Fest',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      categories: ['Food', 'Entertainment'],
      budget: 1000,
      notes: 'Annual college festival'
    },
    {
      id: '2',
      title: 'Study Group',
      date: new Date().toISOString().split('T')[0],
      categories: ['Coffee', 'Transport'],
      budget: 200,
      notes: 'Weekly study session'
    }
  ],
  lockups: [
    {
      id: '1',
      title: 'Semester Fee',
      amount: 15000,
      balance: 15000
    },
    {
      id: '2',
      title: 'Emergency Fund',
      amount: 5000,
      balance: 5000
    }
  ],
  savings: [
    {
      id: '1',
      title: 'New Laptop',
      targetAmount: 50000,
      currentAmount: 15000
    },
    {
      id: '2',
      title: 'Summer Trip',
      targetAmount: 20000,
      currentAmount: 5000
    }
  ],
  categories: defaultCategories,
  categoryLimits: [],
  theme: 'light'
});

export const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored) as AppState;
      // Merge with initial state to ensure all new properties exist
      return { ...getInitialState(), ...parsedState };
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return getInitialState();
};