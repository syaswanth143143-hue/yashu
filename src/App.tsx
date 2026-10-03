import React, { useState, useEffect } from 'react';
import { Transaction, Currency, UserProfile, CategoryBudgetSetting } from './types';
import { INITIAL_TRANSACTIONS } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { AnalyticsView } from './components/AnalyticsView';
import { AiAssistantView } from './components/AiAssistantView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { VeoVideoModal } from './components/VeoVideoModal';
import { SearchGroundingModal } from './components/SearchGroundingModal';
import { VideoAnalysisModal } from './components/VideoAnalysisModal';
import { VoiceTranscribeModal } from './components/VoiceTranscribeModal';
import { ReportExportModal } from './components/ReportExportModal';
import { GmailLoginModal } from './components/GmailLoginModal';
import { CategoryBudgetsModal } from './components/CategoryBudgetsModal';
import {
  DEFAULT_BUDGET_SETTINGS,
  loadCategoryBudgets,
  saveCategoryBudgets,
  computeCategoryBudgetStatuses,
} from './services/budgetService';
import { auth, onAuthStateChanged, signOutFirebase, User } from './firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'expenses' | 'analytics' | 'ai-assistant'>('dashboard');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('tracker_pro_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached user', e);
      }
    }
    return {
      name: 'Yaswanth',
      email: 'syaswanth143143@gmail.com',
      provider: 'gmail',
      isLoggedIn: true,
    };
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tracker_pro_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Category Budgets State
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetSetting[]>(DEFAULT_BUDGET_SETTINGS);

  // Modal states
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isVeoOpen, setIsVeoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVideoAnalysisOpen, setIsVideoAnalysisOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGmailLoginOpen, setIsGmailLoginOpen] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'json'>('pdf');
  const [copilotPrompt, setCopilotPrompt] = useState<string | undefined>();

  // Load budgets on mount & listen to auth
  useEffect(() => {
    loadCategoryBudgets(currentUser?.email ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_') : undefined).then(
      (loaded) => {
        if (loaded && loaded.length > 0) {
          setCategoryBudgets(loaded);
        }
      }
    );

    // Sync with Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        const profile: UserProfile = {
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
          email: fbUser.email || 'user@gmail.com',
          avatarUrl: fbUser.photoURL || undefined,
          provider: 'gmail',
          isLoggedIn: true,
        };
        setCurrentUser(profile);
        loadCategoryBudgets(fbUser.uid).then((b) => {
          if (b && b.length > 0) setCategoryBudgets(b);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('tracker_pro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('tracker_pro_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Compute active budget alert count for badge indicators
  const { alerts } = computeCategoryBudgetStatuses(categoryBudgets, transactions);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    loadCategoryBudgets(user.email.replace(/[^a-zA-Z0-9]/g, '_')).then((b) => {
      if (b && b.length > 0) setCategoryBudgets(b);
    });
  };

  const handleLogout = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.warn('Firebase signout:', e);
    }
    setCurrentUser({
      name: 'Guest User',
      email: 'guest@trackerpro.app',
      provider: 'guest',
      isLoggedIn: false,
    });
    setIsGmailLoginOpen(true);
  };

  // Handler to add a new transaction
  const handleAddTransaction = (newTx: Partial<Transaction>) => {
    const item: Transaction = {
      id: `tx-${Date.now()}`,
      vendor: newTx.vendor || 'Untitled Vendor',
      description: newTx.description || 'Expense',
      memo: newTx.memo,
      invoiceId: newTx.invoiceId || `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      category: (newTx.category as any) || 'Food & Dining',
      date: newTx.date || 'Today',
      account: newTx.account || 'Chase Sapphire Preferred',
      amount: newTx.amount ?? -25.0,
      status: (newTx.status as any) || 'Approved',
      icon: newTx.icon || 'receipt',
    };

    setTransactions((prev) => [item, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'Approved' ? 'Pending' : t.status === 'Pending' ? 'Flagged' : 'Approved';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const handleSaveBudgets = async (updated: CategoryBudgetSetting[]) => {
    setCategoryBudgets(updated);
    const uid = auth.currentUser?.uid || currentUser.email.replace(/[^a-zA-Z0-9]/g, '_');
    await saveCategoryBudgets(updated, uid);
  };

  const handleOpenExport = (type: 'csv' | 'pdf' | 'json') => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const handleNavigateToAiCopilot = (prompt?: string) => {
    setCopilotPrompt(prompt);
    setCurrentTab('ai-assistant');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-['Inter',sans-serif] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab: any) => setCurrentTab(tab)}
        onOpenVeoModal={() => setIsVeoOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenVideoAnalysisModal={() => setIsVideoAnalysisOpen(true)}
        onOpenSearchModal={() => setIsSearchOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        currentUser={currentUser}
        onOpenGmailLogin={() => setIsGmailLoginOpen(true)}
        alertCount={alerts.length}
      />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Fixed Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currency={currency}
          onCurrencyChange={setCurrency}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          currentUser={currentUser}
          onOpenGmailLogin={() => setIsGmailLoginOpen(true)}
          onLogout={handleLogout}
        />

        {/* Routed Content View */}
        <main className="pt-20 px-8 flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              currency={currency}
              categoryBudgets={categoryBudgets}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onNavigateToExpenses={() => setCurrentTab('expenses')}
              onNavigateToAiCopilot={handleNavigateToAiCopilot}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              transactions={transactions}
              currency={currency}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              currency={currency}
              onExportReport={handleOpenExport}
              onOpenSearchModal={() => setIsSearchOpen(true)}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AiAssistantView
              transactions={transactions}
              currency={currency}
              onAddTransaction={handleAddTransaction}
              onOpenVeoModal={() => setIsVeoOpen(true)}
              onOpenVideoAnalysisModal={() => setIsVideoAnalysisOpen(true)}
              onOpenSearchModal={() => setIsSearchOpen(true)}
              initialPrompt={copilotPrompt}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddTransaction={handleAddTransaction}
        currency={currency}
      />

      <CategoryBudgetsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={categoryBudgets}
        onSaveBudgets={handleSaveBudgets}
        currency={currency}
        transactions={transactions}
      />

      <VeoVideoModal
        isOpen={isVeoOpen}
        onClose={() => setIsVeoOpen(false)}
      />

      <SearchGroundingModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <VideoAnalysisModal
        isOpen={isVideoAnalysisOpen}
        onClose={() => setIsVideoAnalysisOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <VoiceTranscribeModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currency={currency}
        initialType={exportType}
      />

      <GmailLoginModal
        isOpen={isGmailLoginOpen}
        onClose={() => setIsGmailLoginOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
