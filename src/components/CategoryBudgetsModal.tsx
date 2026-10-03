import React, { useState, useEffect } from 'react';
import { CategoryBudgetSetting, Currency, Transaction } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatNumber } from '../utils/formatters';
import { computeCategoryBudgetStatuses } from '../services/budgetService';

interface CategoryBudgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudgetSetting[];
  onSaveBudgets: (updated: CategoryBudgetSetting[]) => void;
  currency: Currency;
  transactions?: Transaction[];
}

export const CategoryBudgetsModal: React.FC<CategoryBudgetsModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
  currency,
  transactions = [],
}) => {
  const [items, setItems] = useState<CategoryBudgetSetting[]>(budgets);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState(500);
  const [newCategoryThreshold, setNewCategoryThreshold] = useState(80);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentSymbol = CURRENCIES[currency]?.symbol || '$';
  const currencyRate = CURRENCIES[currency]?.rateToUSD || 1;

  useEffect(() => {
    setItems(budgets);
  }, [budgets, isOpen]);

  // Compute live preview statuses
  const { statuses } = computeCategoryBudgetStatuses(items, transactions);
  const spentMap = new Map<string, number>();
  statuses.forEach((s) => spentMap.set(s.category, s.spent));

  if (!isOpen) return null;

  const handleLimitChange = (category: string, newLimit: number) => {
    setItems((prev) =>
      prev.map((item) => (item.category === category ? { ...item, monthlyLimit: Math.max(0, newLimit) } : item))
    );
  };

  const handleThresholdChange = (category: string, newThreshold: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.category === category
          ? { ...item, warningThresholdPercent: Math.min(100, Math.max(10, newThreshold)) }
          : item
      )
    );
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (items.some((i) => i.category.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already has a budget defined.');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        category: trimmed,
        monthlyLimit: newCategoryLimit,
        warningThresholdPercent: newCategoryThreshold,
      },
    ]);
    setNewCategoryName('');
    setShowAddForm(false);
  };

  const handleRemoveCategory = (cat: string) => {
    setItems((prev) => prev.filter((i) => i.category !== cat));
  };

  const handleSave = () => {
    onSaveBudgets(items);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-[#191c1e]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden p-6 relative border border-[#eceef0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Define Monthly Category Budgets</h3>
              <p className="text-xs text-[#76777d]">
                Set spending ceilings & proactive warning thresholds per expense category
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f2f4f6] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informational callout */}
        <div className="bg-[#f2f4f6] px-4 py-3 rounded-xl my-3 flex items-center gap-3 text-xs text-[#45464d]">
          <span className="material-symbols-outlined text-[#006c49] text-[20px] shrink-0">info</span>
          <span>
            When current spending reaches the set <strong>Warning Threshold (%)</strong> or exceeds the{' '}
            <strong>Monthly Budget</strong>, an instant alert banner and warning indicator will display on your{' '}
            <strong>Dashboard</strong>.
          </span>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-[#76777d]">
            <span>Category & Live Spending</span>
            <div className="flex items-center gap-14 mr-4">
              <span>Monthly Budget</span>
              <span>Warning Threshold</span>
            </div>
          </div>

          {items.map((item) => {
            const spentUSD = spentMap.get(item.category) || 0;
            const spentDisplay = spentUSD * currencyRate;
            const limitDisplay = item.monthlyLimit * currencyRate;
            const thresholdValue = (item.monthlyLimit * (item.warningThresholdPercent / 100)) * currencyRate;
            const pct = limitDisplay > 0 ? (spentDisplay / limitDisplay) * 100 : 0;
            const isExceeded = spentDisplay > limitDisplay;
            const isNear = !isExceeded && pct >= item.warningThresholdPercent;

            return (
              <div
                key={item.category}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isExceeded
                    ? 'bg-[#ba1a1a]/5 border-[#ba1a1a]/30'
                    : isNear
                    ? 'bg-[#b26a00]/5 border-[#b26a00]/30'
                    : 'bg-white border-[#eceef0] hover:border-[#c6c6cd]'
                }`}
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#191c1e]">{item.category}</span>
                    {isExceeded && (
                      <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        Exceeded ({pct.toFixed(0)}%)
                      </span>
                    )}
                    {isNear && (
                      <span className="bg-[#b26a00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">priority_high</span>
                        Near Limit ({pct.toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#76777d]">
                    <span>
                      Spent: <strong className="text-[#191c1e]">{formatNumber(spentUSD, currency)}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Warns at {item.warningThresholdPercent}% ({currentSymbol}{Math.round(thresholdValue).toLocaleString()})
                    </span>
                  </div>

                  {/* Visual mini progress */}
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full mt-2 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExceeded ? 'bg-[#ba1a1a]' : isNear ? 'bg-[#b26a00]' : 'bg-[#006c49]'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Budget Limit Input */}
                  <div className="flex items-center bg-[#f2f4f6] rounded-xl px-3 py-2 border border-transparent focus-within:border-[#191c1e] transition-colors">
                    <span className="text-xs font-semibold text-[#45464d] mr-1">{currentSymbol}</span>
                    <input
                      type="number"
                      value={Math.round(item.monthlyLimit * currencyRate)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleLimitChange(item.category, val / currencyRate);
                      }}
                      className="bg-transparent border-none outline-none w-20 text-xs font-bold text-[#191c1e]"
                      min="0"
                      step="50"
                      title="Set monthly spending limit"
                    />
                  </div>

                  {/* Warning Threshold Slider */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={item.warningThresholdPercent}
                        onChange={(e) => handleThresholdChange(item.category, parseInt(e.target.value, 10))}
                        className="w-20 accent-[#006c49] cursor-pointer"
                        title="Set threshold warning percentage"
                      />
                      <span className="text-[11px] font-bold text-[#006c49]">
                        {item.warningThresholdPercent}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(item.category)}
                      className="p-1 rounded-lg text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors"
                      title="Remove category"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Category Section */}
          {showAddForm ? (
            <div className="bg-[#f7f9fb] p-4 rounded-xl border border-[#c6c6cd] flex flex-col gap-3 animate-in fade-in">
              <span className="text-xs font-bold text-[#191c1e]">Add New Budget Category</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Healthcare)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-white px-3 py-2 rounded-xl border border-[#eceef0] text-xs font-medium text-[#191c1e] outline-none focus:border-[#191c1e]"
                />
                <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-[#eceef0]">
                  <span className="text-xs text-[#76777d] mr-1">{currentSymbol}</span>
                  <input
                    type="number"
                    placeholder="Limit"
                    value={newCategoryLimit}
                    onChange={(e) => setNewCategoryLimit(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border-none text-xs outline-none font-semibold text-[#191c1e]"
                    min="10"
                    step="50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#76777d]">Warn:</span>
                  <input
                    type="number"
                    value={newCategoryThreshold}
                    onChange={(e) => setNewCategoryThreshold(parseInt(e.target.value, 10) || 80)}
                    className="w-16 bg-white px-2 py-2 rounded-xl border border-[#eceef0] text-xs font-semibold text-[#006c49] outline-none"
                    min="50"
                    max="100"
                    step="5"
                  />
                  <span className="text-xs font-bold text-[#006c49]">%</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-[#45464d] hover:bg-[#eceef0] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-1.5 text-xs font-semibold bg-[#191c1e] text-white rounded-lg hover:bg-black"
                >
                  Add Budget
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="py-3 px-4 rounded-xl border-2 border-dashed border-[#eceef0] hover:border-[#006c49] hover:bg-[#006c49]/5 text-xs font-semibold text-[#45464d] hover:text-[#006c49] flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Custom Category Budget
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#eceef0] mt-2">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-semibold text-[#006c49] flex items-center gap-1 animate-in fade-in">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Budgets updated successfully!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#191c1e] text-white hover:bg-black shadow-sm flex items-center gap-2 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save & Apply Budgets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
