import { AppState, CategoryLimit } from '@/types';

export const getCategoryStatus = (
    category: string,
    categoryLimits: CategoryLimit[],
    transactions: any[]
) => {
    const limit = categoryLimits.find(l => l.category === category);
    if (!limit) return { hasLimit: false, isOverLimit: false };

    const now = new Date();

    // Calculate daily spending
    const dailyStart = new Date();
    dailyStart.setHours(0, 0, 0, 0);
    const dailySpending = transactions
        .filter(t =>
            t.type === 'expense' &&
            t.category === category &&
            new Date(t.date) >= dailyStart
        )
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly spending
    const monthlyStart = new Date();
    monthlyStart.setDate(1);
    monthlyStart.setHours(0, 0, 0, 0);
    const monthlySpending = transactions
        .filter(t =>
            t.type === 'expense' &&
            t.category === category &&
            new Date(t.date) >= monthlyStart
        )
        .reduce((sum, t) => sum + t.amount, 0);

    // Check if over limits
    const dailyOverLimit = limit.dailyLimit ? dailySpending >= limit.dailyLimit : false;
    const monthlyOverLimit = limit.monthlyLimit ? monthlySpending >= limit.monthlyLimit : false;

    return {
        hasLimit: true,
        isOverLimit: dailyOverLimit || monthlyOverLimit,
        dailyOverLimit,
        monthlyOverLimit,
        dailySpending,
        monthlySpending,
        dailyLimit: limit.dailyLimit,
        monthlyLimit: limit.monthlyLimit
    };
};
