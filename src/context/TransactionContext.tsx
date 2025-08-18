import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Transaction, Event, Lockup, Saving, User, CategoryLimit } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

type Action =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_LOCKUP'; payload: Lockup }
  | { type: 'DELETE_LOCKUP'; payload: string }
  | { type: 'SPEND_FROM_LOCKUP'; payload: { id: string; amount: number } }
  | { type: 'ADD_SAVING'; payload: Saving }
  | { type: 'DELETE_SAVING'; payload: string }
  | { type: 'ADD_TO_SAVING'; payload: { id: string; amount: number } }
  | { type: 'SPEND_FROM_SAVING'; payload: { id: string; amount: number } }
  | { type: 'ADD_CATEGORY'; payload: { type: 'income' | 'expense'; category: string } }
  | { type: 'DELETE_CATEGORY'; payload: { type: 'income' | 'expense'; category: string } }
  | { type: 'SET_CATEGORY_LIMIT'; payload: CategoryLimit }
  | { type: 'DELETE_CATEGORY_LIMIT'; payload: string }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOAD_STATE'; payload: AppState };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };

    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload)
      };

    case 'ADD_LOCKUP':
      return { ...state, lockups: [action.payload, ...state.lockups] };

    case 'DELETE_LOCKUP':
      return {
        ...state,
        lockups: state.lockups.filter(l => l.id !== action.payload)
      };

    case 'SPEND_FROM_LOCKUP':
      return {
        ...state,
        lockups: state.lockups.map(l =>
          l.id === action.payload.id
            ? { ...l, balance: Math.max(0, l.balance - action.payload.amount) }
            : l
        )
      };

    case 'ADD_SAVING':
      return { ...state, savings: [action.payload, ...state.savings] };

    case 'DELETE_SAVING':
      return {
        ...state,
        savings: state.savings.filter(s => s.id !== action.payload)
      };

    case 'ADD_TO_SAVING':
      return {
        ...state,
        savings: state.savings.map(s =>
          s.id === action.payload.id
            ? { ...s, currentAmount: Math.min(s.targetAmount, s.currentAmount + action.payload.amount) }
            : s
        )
      };

    case 'SPEND_FROM_SAVING':
      return {
        ...state,
        savings: state.savings.map(s =>
          s.id === action.payload.id
            ? { ...s, currentAmount: Math.max(0, s.currentAmount - action.payload.amount) }
            : s
        )
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: [...state.categories[action.payload.type], action.payload.category]
        }
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.payload.type]: state.categories[action.payload.type].filter(c => c !== action.payload.category)
        }
      };

    case 'SET_CATEGORY_LIMIT':
      const existingLimitIndex = state.categoryLimits.findIndex(l => l.category === action.payload.category);
      if (existingLimitIndex >= 0) {
        // Update existing limit
        return {
          ...state,
          categoryLimits: state.categoryLimits.map((limit, index) =>
            index === existingLimitIndex ? action.payload : limit
          )
        };
      } else {
        // Add new limit
        return {
          ...state,
          categoryLimits: [...state.categoryLimits, action.payload]
        };
      }

    case 'DELETE_CATEGORY_LIMIT':
      return {
        ...state,
        categoryLimits: state.categoryLimits.filter(l => l.category !== action.payload)
      };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helper functions
  getTotalBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getTotalLockups: () => number;
  getTotalSavings: () => number;
  getAvailableBalance: () => number;
  checkCategoryLimit: (category: string, amount: number) => { dailyExceeded: boolean; monthlyExceeded: boolean };
  getCategorySpending: (category: string, period: 'daily' | 'monthly') => number;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, loadFromStorage());

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Helper functions
  const getTotalIncome = () =>
    state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = () =>
    state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

  const getTotalBalance = () => getTotalIncome() - getTotalExpense();

  const getTotalLockups = () =>
    state.lockups.reduce((sum, l) => sum + l.balance, 0);

  const getTotalSavings = () =>
    state.savings.reduce((sum, s) => sum + s.currentAmount, 0);

  const getAvailableBalance = () =>
    getTotalBalance() - getTotalLockups() - getTotalSavings();

  const getCategorySpending = (category: string, period: 'daily' | 'monthly') => {
    const now = new Date();
    const startDate = new Date();

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    return state.transactions
      .filter(t =>
        t.type === 'expense' &&
        t.category === category &&
        new Date(t.date) >= startDate
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const checkCategoryLimit = (category: string, amount: number) => {
    const limit = state.categoryLimits.find(l => l.category === category);
    if (!limit) {
      return { dailyExceeded: false, monthlyExceeded: false };
    }

    const dailySpending = getCategorySpending(category, 'daily');
    const monthlySpending = getCategorySpending(category, 'monthly');

    const dailyExceeded = limit.dailyLimit ? (dailySpending + amount) > limit.dailyLimit : false;
    const monthlyExceeded = limit.monthlyLimit ? (monthlySpending + amount) > limit.monthlyLimit : false;

    return { dailyExceeded, monthlyExceeded };
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    getTotalBalance,
    getTotalIncome,
    getTotalExpense,
    getTotalLockups,
    getTotalSavings,
    getAvailableBalance,
    getCategorySpending,
    checkCategoryLimit
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};