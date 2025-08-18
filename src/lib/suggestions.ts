import { Event, Transaction } from '@/types';
import { format, isToday, isWithinInterval, addDays } from 'date-fns';

export const getFinanceTips = (): string[] => [
  "Set a weekly spending limit and track your progress daily",
  "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
  "Cook meals at home to save on food expenses",
  "Take advantage of student discounts whenever possible",
  "Review your subscriptions monthly and cancel unused ones",
  "Use campus resources like libraries and gyms instead of paying for alternatives",
  "Plan major purchases during sale seasons",
  "Consider buying textbooks used or renting them",
  "Track small daily expenses - they add up quickly",
  "Set up automatic transfers to your savings account"
];

export const getEventSuggestions = (
  events: Event[], 
  transactions: Transaction[]
): string[] => {
  const suggestions: string[] = [];
  const today = new Date();
  const nextWeek = addDays(today, 7);

  // Check for upcoming events
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return isWithinInterval(eventDate, { start: today, end: nextWeek });
  });

  upcomingEvents.forEach(event => {
    const eventDate = new Date(event.date);
    if (isToday(eventDate)) {
      suggestions.push(`Today's event: ${event.title} - Consider tracking expenses for: ${event.categories.join(', ')}`);
    } else {
      suggestions.push(`Upcoming event: ${event.title} on ${format(eventDate, 'MMM dd')} - Budget for: ${event.categories.join(', ')}`);
    }
  });

  // Add spending pattern suggestions based on transactions
  const recentExpenses = transactions
    .filter(t => t.type === 'expense')
    .slice(0, 10);

  const topCategories = recentExpenses
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(topCategories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  if (sortedCategories.length > 0) {
    suggestions.push(`Your top spending category this period: ${sortedCategories[0][0]} (₹${sortedCategories[0][1].toFixed(0)})`);
  }

  return suggestions.length > 0 ? suggestions : getFinanceTips().slice(0, 2);
};

export const getFrequentCategories = (transactions: Transaction[]): string[] => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryCount = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([category]) => category);
};