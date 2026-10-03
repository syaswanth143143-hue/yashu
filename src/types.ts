export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rateToUSD: number; // Multiplier relative to USD
}

export interface Transaction {
  id: string;
  vendor: string;
  description: string;
  memo?: string;
  category: 'Housing & Utilities' | 'Food & Dining' | 'Transport' | 'Utilities' | 'Technology' | 'Office Supplies' | 'Marketing' | 'Travel' | 'Income' | 'Entertainment';
  date: string;
  account: string;
  amount: number; // Positive for income, negative for expense
  status: 'Approved' | 'Pending' | 'Flagged';
  icon?: string;
  invoiceId?: string;
  receiptUrl?: string;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  color: string;
}

export interface CategoryBudgetSetting {
  id?: string;
  category: string;
  monthlyLimit: number;
  warningThresholdPercent: number; // e.g. 80 means warn at 80% of monthlyLimit
}

export interface CategoryBudgetStatus {
  category: string;
  spent: number;
  monthlyLimit: number;
  warningThresholdPercent: number;
  percentageUsed: number;
  isExceeded: boolean;
  isNearThreshold: boolean;
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'gmail' | 'guest';
  isLoggedIn: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  breakdown?: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  tip?: string;
  sources?: { web?: { uri?: string; title?: string } }[];
}
