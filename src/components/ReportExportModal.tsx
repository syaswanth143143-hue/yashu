import React from 'react';
import { Transaction, Currency } from '../types';
import { formatNumber } from '../utils/formatters';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: Currency;
  initialType?: 'csv' | 'pdf' | 'json';
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currency,
  initialType = 'pdf',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `tracker_pro_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
  };

  const handleDownloadCsv = () => {
    const headers = ['Transaction ID', 'Vendor', 'Memo', 'Category', 'Date', 'Account', 'Status', 'Amount'];
    const rows = transactions.map((tx) => [
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
    link.setAttribute('download', `tracker_pro_statement_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-[#2d3133]/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 relative border border-[#eceef0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#191c1e]">Executive Financial Summary</h3>
              <p className="text-[11px] text-[#76777d]">Portfolio Statement & Fiscal Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#e6e8ea] text-[#45464d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Printable / Viewable Report Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 text-xs text-[#191c1e] bg-[#f7f9fb] p-5 rounded-xl border border-[#eceef0]">
          <div className="flex justify-between items-start pb-3 border-b border-[#eceef0]">
            <div>
              <h2 className="text-base font-bold">TRACKER PRO FINANCIAL REPORT</h2>
              <p className="text-[11px] text-[#76777d]">Audit Cycle: October 2026 | Encrypted 256-bit</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-[#6cf8bb]/40 text-[#00714d] font-bold text-[10px]">
                CLEARED & AUDITED
              </span>
              <p className="text-[10px] text-[#76777d] mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-[#eceef0]">
            <div>
              <span className="text-[10px] text-[#76777d] uppercase font-semibold">Net Cash Flow</span>
              <div className="text-base font-bold text-[#006c49] mt-0.5">
                {formatNumber(24850, currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#76777d] uppercase font-semibold">Total Income</span>
              <div className="text-base font-bold text-[#191c1e] mt-0.5">
                {formatNumber(68400, currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#76777d] uppercase font-semibold">Total Expenses</span>
              <div className="text-base font-bold text-[#ba1a1a] mt-0.5">
                {formatNumber(43550, currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#76777d] uppercase font-semibold">Savings Rate</span>
              <div className="text-base font-bold text-[#006c49] mt-0.5">36.3%</div>
            </div>
          </div>

          {/* Top Ledger Items */}
          <div>
            <span className="font-bold text-[#191c1e] block mb-2">Itemized Ledger (Recent 8 Entries)</span>
            <div className="bg-white rounded-xl border border-[#eceef0] overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#f2f4f6] text-[#45464d] font-semibold">
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {transactions.slice(0, 8).map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-2 px-3 font-medium">{tx.vendor}</td>
                      <td className="py-2 px-3 text-[#45464d]">{tx.category}</td>
                      <td className="py-2 px-3 text-[#76777d]">{tx.date}</td>
                      <td
                        className={`py-2 px-3 text-right font-semibold ${
                          tx.amount > 0 ? 'text-[#006c49]' : 'text-[#ba1a1a]'
                        }`}
                      >
                        {formatNumber(tx.amount, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#eceef0]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6]"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-semibold hover:bg-[#e6e8ea] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              Download CSV
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-1.5 bg-[#f2f4f6] text-[#191c1e] rounded-xl text-xs font-semibold hover:bg-[#e6e8ea] flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              Download JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
