export const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    // Income categories
    'salary': '💼',
    'freelance': '💻',
    'part-time job': '💼',
    'scholarship': '🎓',
    'pocket money': '🧧',
    'gift': '🎁',
    'allowance': '💰',
    'investment': '📈',
    'other income': '💸',

    // Expense categories
    'food': '🍔',
    'rent': '🏠',
    'shopping': '🛍️',
    'travel': '🚌',
    'entertainment': '🎬',
    'books': '📚',
    'utilities': '💡',
    'transport': '🚗',
    'healthcare': '🏥',
    'groceries': '🛒',
    'clothing': '👕',
    'coffee': '☕',
    'dining out': '🍽️',
    'sports': '⚽',
    'hobbies': '🎨',
    'subscription': '📱',
    'phone': '📞',
    'internet': '🌐',
    'gym': '💪',
    'beauty': '💄',
    'education': '📖',
    'supplies': '📝',
    'laundry': '🧺',
    'other': '🧾',
    'miscellaneous': '🧾',
    'expense': '💳',
  };

  const key = category.toLowerCase().trim();
  return emojiMap[key] || '🧾';
};

export const defaultCategories = {
  income: [
    'Salary',
    'Part-time Job', 
    'Scholarship',
    'Pocket Money',
    'Gift',
    'Freelance',
    'Other Income'
  ],
  expense: [
    'Food',
    'Rent',
    'Shopping',
    'Travel',
    'Entertainment',
    'Books',
    'Utilities',
    'Transport',
    'Groceries',
    'Coffee',
    'Dining Out',
    'Subscription',
    'Gym',
    'Other'
  ]
};