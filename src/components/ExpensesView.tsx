import React, { useState, useMemo } from 'react';
import { Transaction, Currency } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface ExpensesViewProps {
  transactions: Transaction[];
  currency: Currency;
  onOpenAddExpense: () => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  transactions,
  currency,
  onOpenAddExpense,
  onDeleteTransaction,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Exclude income from expenses list or keep negative amounts
      const isExpense = tx.amount < 0 || tx.category !== 'Income';
      if (!isExpense) return false;

      const matchesSearch =
        tx.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.memo && tx.memo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.invoiceId && tx.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || tx.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' || tx.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [transactions, searchTerm, selectedCategory, selectedStatus]);

  // Pagination (5 per page to match the screenshots "Showing 1 to 5 of 48 transactions")
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentTransactions = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Metrics
  const totalExpensesMtd = 12450.80;
  const pendingApprovals = 1840.00;
  const reimbursable = 3120.50;
  const activeCategoriesCount = 12;

  const toggleSelectAll = () => {
    if (selectedTxIds.length === currentTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(currentTransactions.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Transaction ID', 'Vendor', 'Memo', 'Category', 'Date', 'Account', 'Status', 'Amount'];
    const rows = filtered.map((tx) => [
      tx.invoiceId || tx.id,
      `"${tx.vendor}"`,
      `"${tx.description || tx.memo || ''}"`,
      `"${tx.category}"`,
      `"${tx.date}"`,
      `"${tx.account}"`,
      tx.status,
      tx.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tracker_pro_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Top Stats / Metric Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Expenses (MTD) */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">
              Total Expenses (MTD)
            </span>
            <div className="w-10 h-10 rounded-full bg-[#dae2fd] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#131b2e] text-[20px]">payments</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(totalExpensesMtd, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-[#006c49] font-medium">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>-4.2% from last month</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-10 h-10 rounded-full bg-[#d8e2ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#001a42] text-[20px]">schedule</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(pendingApprovals, currency)}
            </div>
            <div className="text-xs text-[#45464d] mt-1">4 items pending review</div>
          </div>
        </div>

        {/* Reimbursable */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">
              Reimbursable
            </span>
            <div className="w-10 h-10 rounded-full bg-[#6ffbbe]/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#005236] text-[20px]">receipt_long</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(reimbursable, currency)}
            </div>
            <div className="text-xs text-[#006c49] mt-1 font-medium">Ready for export</div>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">
              Active Categories
            </span>
            <div className="w-10 h-10 rounded-full bg-[#e6e8ea] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#191c1e] text-[20px]">category</span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {activeCategoriesCount}
            </div>
            <div className="text-xs text-[#45464d] mt-1">Across 3 departments</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-xs border border-[#eceef0] p-6">
        {/* Filters and Actions Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Bar */}
            <div className="flex items-center bg-[#f2f4f6] rounded-xl px-4 py-2 min-w-[260px] flex-1 md:flex-initial border border-transparent focus-within:border-[#c6c6cd]">
              <span className="material-symbols-outlined text-[#76777d] mr-2 text-[18px]">search</span>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs text-[#191c1e] placeholder:text-[#76777d]"
                placeholder="Search vendor, memo, ID..."
                type="text"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#f2f4f6] pl-9 pr-8 py-2 rounded-xl text-[#191c1e] text-xs font-medium border-none outline-none cursor-pointer hover:bg-[#e6e8ea] transition-colors"
              >
                <option value="All">Category: All</option>
                <option value="Technology">Technology</option>
                <option value="Travel">Travel</option>
                <option value="Food & Dining">Meals & Entertainment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Marketing">Marketing</option>
                <option value="Utilities">Utilities</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-[#76777d] pointer-events-none">
                filter_list
              </span>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[16px] text-[#76777d] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-[#f2f4f6] pl-8 pr-8 py-2 rounded-xl text-[#191c1e] text-xs font-medium border-none outline-none cursor-pointer hover:bg-[#e6e8ea] transition-colors"
              >
                <option value="All">Status: All</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Flagged">Flagged</option>
              </select>
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[16px] text-[#76777d] pointer-events-none">
                verified
              </span>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[16px] text-[#76777d] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 bg-[#f2f4f6] px-3.5 py-2 rounded-xl text-[#191c1e] text-xs font-medium cursor-pointer hover:bg-[#e6e8ea] transition-colors">
              <span className="material-symbols-outlined text-[16px] text-[#76777d]">calendar_today</span>
              <span>Oct 01, 2026 - Oct 24, 2026</span>
              <span className="material-symbols-outlined text-[16px] text-[#76777d]">arrow_drop_down</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 bg-[#f2f4f6] px-4 py-2 rounded-xl text-[#191c1e] text-xs font-semibold hover:bg-[#e6e8ea] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 bg-[#000000] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] text-[#45464d] text-xs font-semibold">
                <th className="py-3 px-4 rounded-l-xl">
                  <input
                    type="checkbox"
                    checked={selectedTxIds.length === currentTransactions.length && currentTransactions.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded accent-black cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Transaction ID & Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 rounded-r-xl text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs text-[#191c1e] divide-y divide-[#eceef0]">
              {currentTransactions.map((tx) => {
                const isSelected = selectedTxIds.includes(tx.id);
                return (
                  <tr key={tx.id} className="hover:bg-[#f2f4f6]/50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(tx.id)}
                        className="rounded accent-black cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#eceef0] flex items-center justify-center font-bold text-[#45464d]">
                          <span className="material-symbols-outlined text-[18px]">{tx.icon || 'receipt'}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#191c1e]">{tx.vendor}</div>
                          <div className="text-[11px] text-[#76777d]">
                            {tx.memo || `${tx.invoiceId || 'INV-000'} • ${tx.description}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#eceef0] text-[#45464d] text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#45464d]">{tx.date}</td>
                    <td className="py-4 px-4">
                      {tx.status === 'Approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6cf8bb]/40 text-[#00714d] text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00714d]"></span>
                          Approved
                        </span>
                      )}
                      {tx.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#d8e2ff] text-[#001a42] text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#001a42]"></span>
                          Pending
                        </span>
                      )}
                      {tx.status === 'Flagged' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#93000a]"></span>
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-medium font-mono text-sm">
                      {formatNumber(tx.amount, currency)}
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="p-1.5 rounded-lg hover:bg-[#eceef0] text-[#45464d] transition-colors"
                        title="Actions"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>

                      {openMenuId === tx.id && (
                        <div className="absolute right-4 top-10 w-44 bg-white rounded-xl shadow-lg border border-[#eceef0] py-1.5 z-30 text-left">
                          <button
                            onClick={() => {
                              onToggleStatus(tx.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#191c1e] hover:bg-[#f2f4f6] flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                            Toggle Status
                          </button>
                          <button
                            onClick={() => {
                              onDeleteTransaction(tx.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#ba1a1a] hover:bg-[#ffdad6]/30 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#eceef0]">
          <div className="text-xs text-[#45464d]">
            Showing <span className="font-semibold text-[#191c1e]">{filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#191c1e]">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
            <span className="font-semibold text-[#191c1e]">{filtered.length}</span> transactions
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#f2f4f6] text-[#191c1e] disabled:opacity-40 hover:bg-[#e6e8ea] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors ${
                  currentPage === pg
                    ? 'bg-[#000000] text-white'
                    : 'hover:bg-[#f2f4f6] text-[#191c1e]'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#f2f4f6] text-[#191c1e] disabled:opacity-40 hover:bg-[#e6e8ea] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
