import React, { useState } from 'react';
import { Transaction, Currency, CategoryBudgetSetting } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { computeCategoryBudgetStatuses } from '../services/budgetService';

interface DashboardViewProps {
  transactions: Transaction[];
  currency: Currency;
  categoryBudgets: CategoryBudgetSetting[];
  onOpenBudgetModal: () => void;
  onOpenAddExpense: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToAiCopilot: (initialPrompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  currency,
  categoryBudgets,
  onOpenBudgetModal,
  onOpenAddExpense,
  onNavigateToExpenses,
  onNavigateToAiCopilot,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Calculate budget statuses, warnings, and alerts
  const { statuses, alerts, totalBudget } = computeCategoryBudgetStatuses(
    categoryBudgets,
    transactions
  );

  // Active alerts that haven't been dismissed by the user
  const activeAlerts = alerts.filter((a) => !dismissedAlerts.includes(a.category));

  // Compute overall totals
  const totalBalance = 24580.45;
  const spentThisMonth = transactions
    .filter((tx) => tx.amount < 0 && tx.category !== 'Income')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) + 1200; // Realistic baseline plus ledger items

  const budgetMax = totalBudget > 0 ? totalBudget : 4500.0;
  const savedThisMonth = Math.max(0, budgetMax - spentThisMonth);

  // Recent transactions (latest 5)
  const recentTransactions = transactions.slice(0, 5);

  const handleDismissAlert = (category: string) => {
    setDismissedAlerts((prev) => [...prev, category]);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Dynamic Spending Threshold Warnings / Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="mb-6 flex flex-col gap-3">
          {activeAlerts.map((alert) => {
            const isExceeded = alert.isExceeded;
            const overAmount = alert.spent - alert.monthlyLimit;

            return (
              <div
                key={alert.category}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 ${
                  isExceeded
                    ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#410002]'
                    : 'bg-[#ff9800]/10 border-[#ff9800]/30 text-[#4a2800]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isExceeded ? 'bg-[#ba1a1a] text-white' : 'bg-[#ff9800] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isExceeded ? 'error' : 'warning'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70">
                        {isExceeded ? 'Budget Exceeded Warning' : 'Threshold Warning'}
                      </span>
                      <h4 className="text-sm font-bold text-[#191c1e]">
                        {alert.category}:{' '}
                        {isExceeded
                          ? `Exceeded budget by ${formatNumber(overAmount, currency)}!`
                          : `Approaching monthly limit (${alert.percentageUsed.toFixed(0)}% consumed)`}
                      </h4>
                    </div>
                    <p className="text-xs text-[#45464d] mt-1 leading-relaxed">
                      You have spent{' '}
                      <strong className="text-[#191c1e] font-bold">
                        {formatNumber(alert.spent, currency)}
                      </strong>{' '}
                      out of your{' '}
                      <strong className="text-[#191c1e] font-bold">
                        {formatNumber(alert.monthlyLimit, currency)}
                      </strong>{' '}
                      monthly budget ({alert.percentageUsed.toFixed(0)}%). Warning threshold is set at{' '}
                      <strong>{alert.warningThresholdPercent}%</strong> ({formatNumber(
                        alert.monthlyLimit * (alert.warningThresholdPercent / 100),
                        currency
                      )}).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={onOpenBudgetModal}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                      isExceeded
                        ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                        : 'bg-[#ff9800] text-white hover:bg-[#e68900]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    Adjust Budget
                  </button>
                  <button
                    onClick={onNavigateToExpenses}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white text-[#191c1e] border border-[#eceef0] transition-colors"
                  >
                    View Expenses
                  </button>
                  <button
                    onClick={() => handleDismissAlert(alert.category)}
                    className="p-1.5 text-[#76777d] hover:text-[#191c1e] hover:bg-black/5 rounded-lg transition-colors"
                    title="Dismiss alert"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top Welcome & Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-black/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Total Balance</span>
              <span className="material-symbols-outlined text-[#006c49]">account_balance_wallet</span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(totalBalance, currency)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-[#006c49] font-medium">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+12.4% from last month</span>
          </div>
        </div>

        {/* Monthly Spending Card */}
        <div className={`p-6 rounded-xl shadow-xs border flex flex-col justify-between relative overflow-hidden group transition-all ${
          activeAlerts.length > 0 ? 'bg-white border-[#ba1a1a]/40 ring-1 ring-[#ba1a1a]/20' : 'bg-white border-[#eceef0] hover:border-[#c6c6cd]'
        }`}>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ba1a1a]/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Spent This Month</span>
              <span className="material-symbols-outlined text-[#ba1a1a]">payments</span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(spentThisMonth, currency)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs">
            <div className="text-[#45464d]">
              <span className="text-[#191c1e] font-semibold">Budget:</span> {formatNumber(budgetMax, currency)}
            </div>
            {activeAlerts.length > 0 && (
              <span className="text-[#ba1a1a] font-bold text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {activeAlerts.length} alert{activeAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Monthly Savings Card */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#3980f4]/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Saved This Month</span>
              <span className="material-symbols-outlined text-[#3980f4]">savings</span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(savedThisMonth, currency)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-[#006c49] font-medium">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>On track for goal</span>
          </div>
        </div>

        {/* Quick Action / Quick-Add Card */}
        <div className="bg-[#131b2e] p-6 rounded-xl shadow-xs flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/5 rounded-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#7c839b] uppercase tracking-wider">Quick Actions</span>
              <span className="material-symbols-outlined text-[#7c839b]">bolt</span>
            </div>
            <div className="text-xl font-bold tracking-tight">New Transaction</div>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="mt-4 w-full bg-white text-[#191c1e] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#e6e8ea] transition-colors shadow-xs active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Expense
          </button>
        </div>
      </div>

      {/* Middle Grid: Budget Progress & AI Assistant Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Budget Progress Bar Component */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#191c1e]">Monthly Budget Allocation</h3>
                  {activeAlerts.length > 0 && (
                    <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      Threshold Exceeded
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#45464d] mt-0.5">
                  {((spentThisMonth / budgetMax) * 100).toFixed(0)}% of total monthly budget consumed
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenBudgetModal}
                  className="bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors border border-[#eceef0]"
                  title="Configure monthly limits and warnings per category"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  Manage Budgets
                </button>
                <span className="text-xs font-medium bg-[#f2f4f6] px-3.5 py-1.5 rounded-full text-[#191c1e]">
                  Current Period
                </span>
              </div>
            </div>

            {/* Multi-segment progress bar with threshold indicator */}
            <div className="w-full h-4 bg-[#f2f4f6] rounded-full overflow-hidden flex gap-1 mb-6 p-0.5">
              {statuses.slice(0, 4).map((s, idx) => {
                const pct = budgetMax > 0 ? (s.spent / budgetMax) * 100 : 20;
                return (
                  <div
                    key={s.category}
                    className={`h-full transition-all duration-300 ${
                      idx === 0 ? 'rounded-l-full' : ''
                    } ${s.isExceeded ? 'bg-[#ba1a1a]' : s.isNearThreshold ? 'bg-[#ff9800]' : ''}`}
                    style={{
                      width: `${Math.min(35, Math.max(10, pct))}%`,
                      backgroundColor: s.isExceeded ? '#ba1a1a' : s.isNearThreshold ? '#ff9800' : s.color,
                    }}
                    title={`${s.category}: ${formatNumber(s.spent, currency)} (${s.percentageUsed.toFixed(0)}%)`}
                  />
                );
              })}
              <div
                className="bg-[#e0e3e5] h-full rounded-r-full transition-all flex-1"
                title="Remaining Budget Capacity"
              />
            </div>

            {/* Dynamic Category breakdown cards with Warning Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statuses.slice(0, 4).map((item) => {
                return (
                  <div
                    key={item.category}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isExceeded
                        ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/40 shadow-xs'
                        : item.isNearThreshold
                        ? 'bg-[#ff9800]/5 border-[#ff9800]/40'
                        : 'bg-[#f2f4f6] border-[#eceef0]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-[#45464d] truncate">{item.category}</div>
                      {item.isExceeded && (
                        <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]" title="Exceeded limit!">
                          warning
                        </span>
                      )}
                      {item.isNearThreshold && (
                        <span className="material-symbols-outlined text-[#ff9800] text-[16px]" title="Near threshold!">
                          priority_high
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-[#191c1e] my-0.5">
                      {formatNumber(item.spent, currency)}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-[11px] text-[#76777d]">
                        Limit: {formatNumber(item.monthlyLimit, currency)}
                      </span>
                      {item.isExceeded ? (
                        <span className="text-[#ba1a1a] font-bold text-[11px]">
                          +{Math.max(0, item.percentageUsed - 100).toFixed(0)}% over
                        </span>
                      ) : item.isNearThreshold ? (
                        <span className="text-[#ff9800] font-bold text-[11px]">
                          {item.percentageUsed.toFixed(0)}% (warn)
                        </span>
                      ) : (
                        <span className="text-[#006c49] font-medium text-[11px]">
                          {item.percentageUsed.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instant AI Budget Summary Widget */}
        <div className="bg-[#001a42] text-white p-6 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden border border-[#001a42]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#4edea3] text-[22px]">smart_toy</span>
              <h3 className="text-base font-bold text-white">AI Financial Advisor</h3>
            </div>
            <p className="text-xs text-[#d8e2ff] leading-relaxed mb-4">
              {activeAlerts.length > 0 ? (
                <>
                  <span className="text-[#ff9494] font-semibold">
                    ⚠️ Spending Alert:
                  </span>{' '}
                  You have exceeded set thresholds in{' '}
                  <strong className="text-white">
                    {activeAlerts.map((a) => a.category).join(', ')}
                  </strong>
                  . We recommend pacing upcoming non-essential transactions to maintain your savings trajectory.
                </>
              ) : (
                <>
                  "Great discipline this week! All category expenditures remain safely below your defined warning
                  thresholds. You're securely on track to reach your {formatNumber(1200, currency)} savings target."
                </>
              )}
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#4edea3] font-medium">Updated live</span>
            <button
              onClick={() =>
                onNavigateToAiCopilot(
                  activeAlerts.length > 0
                    ? `How can I balance my budget now that ${activeAlerts[0].category} has exceeded its threshold?`
                    : 'How can I optimize my monthly category budgets for higher savings?'
                )
              }
              className="text-xs text-white hover:underline flex items-center gap-1 font-semibold group"
            >
              Ask AI a question
              <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#eceef0] overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-[#eceef0]">
          <div>
            <h3 className="text-lg font-bold text-[#191c1e]">Recent Transactions</h3>
            <p className="text-xs text-[#45464d] mt-0.5">Showing latest activity across all connected accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToExpenses}
              className="bg-[#f2f4f6] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#191c1e] hover:bg-[#e6e8ea] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button
              onClick={onNavigateToExpenses}
              className="text-xs font-semibold text-[#191c1e] hover:underline"
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] text-[#45464d] text-xs font-semibold">
                <th className="py-3 px-6">Merchant / Description</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Account</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] text-sm text-[#191c1e]">
              {recentTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <tr key={tx.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#e6e8ea] flex items-center justify-center text-[#191c1e]">
                        <span className="material-symbols-outlined text-[18px]">{tx.icon || 'receipt'}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-[#191c1e]">{tx.vendor}</div>
                        <div className="text-[11px] text-[#76777d]">{tx.description || tx.memo}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2.5 py-1 rounded-full text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-[#76777d]">{tx.date}</td>
                    <td className="py-3.5 px-6 text-xs text-[#76777d]">{tx.account}</td>
                    <td className={`py-3.5 px-6 text-right text-xs font-semibold ${isPositive ? 'text-[#006c49]' : 'text-[#ba1a1a]'}`}>
                      {formatCurrency(tx.amount, currency, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
