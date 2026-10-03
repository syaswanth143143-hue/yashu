import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../types';
import { formatNumber } from '../utils/formatters';
import { CURRENCIES } from '../data/initialData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AnalyticsViewProps {
  currency: Currency;
  onExportReport: (type: 'csv' | 'pdf' | 'json') => void;
  onOpenSearchModal: () => void;
  transactions?: Transaction[];
}

interface MonthlyCategoryData {
  month: string;
  fullMonth: string;
  Housing: number;
  'Food & Dining': number;
  Technology: number;
  Travel: number;
  Transport: number;
  Discretionary: number;
  total: number;
  [key: string]: string | number;
}

const CATEGORY_COLORS: Record<string, { stroke: string; fill: string; label: string }> = {
  Housing: { stroke: '#191c1e', fill: '#191c1e', label: 'Housing' },
  'Food & Dining': { stroke: '#006c49', fill: '#006c49', label: 'Food & Dining' },
  Technology: { stroke: '#3980f4', fill: '#3980f4', label: 'Technology' },
  Travel: { stroke: '#ba1a1a', fill: '#ba1a1a', label: 'Travel & Leisure' },
  Transport: { stroke: '#ff9800', fill: '#ff9800', label: 'Transport' },
  Discretionary: { stroke: '#7b1fa2', fill: '#7b1fa2', label: 'Discretionary' },
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currency,
  onExportReport,
  onOpenSearchModal,
  transactions = [],
}) => {
  const [timePeriod, setTimePeriod] = useState<'Trailing 12M' | 'Last 6M' | 'YTD 2026'>('Trailing 12M');
  const [chartMode, setChartMode] = useState<'area' | 'stacked' | 'lines' | 'bars'>('stacked');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<MonthlyCategoryData | null>(null);

  const currencyConfig = CURRENCIES[currency] || { rateToUSD: 1, symbol: '$' };
  const rate = currencyConfig.rateToUSD;

  // Baseline 12 months dataset (Nov 2025 -> Oct 2026)
  const baseMonthlyTrends: MonthlyCategoryData[] = useMemo(() => {
    // Calculate any live Oct additions from transactions
    let liveFood = 950;
    let liveTech = 1240;
    let liveTravel = 485;
    let liveTransport = 420;

    transactions.forEach((tx) => {
      if (tx.amount < 0 && tx.category !== 'Income') {
        const val = Math.abs(tx.amount);
        if (tx.category.includes('Food') || tx.category.includes('Dining')) {
          liveFood += val * 0.1;
        } else if (tx.category.includes('Tech')) {
          liveTech += val * 0.1;
        } else if (tx.category.includes('Travel')) {
          liveTravel += val * 0.1;
        } else if (tx.category.includes('Transport')) {
          liveTransport += val * 0.1;
        }
      }
    });

    const data: MonthlyCategoryData[] = [
      {
        month: 'Nov',
        fullMonth: 'November 2025',
        Housing: 1800,
        'Food & Dining': 890,
        Technology: 1100,
        Travel: 350,
        Transport: 420,
        Discretionary: 320,
        total: 4880,
      },
      {
        month: 'Dec',
        fullMonth: 'December 2025',
        Housing: 1800,
        'Food & Dining': 1250,
        Technology: 950,
        Travel: 1200,
        Transport: 480,
        Discretionary: 580,
        total: 6260,
      },
      {
        month: 'Jan',
        fullMonth: 'January 2026',
        Housing: 1800,
        'Food & Dining': 820,
        Technology: 1400,
        Travel: 200,
        Transport: 390,
        Discretionary: 280,
        total: 4890,
      },
      {
        month: 'Feb',
        fullMonth: 'February 2026',
        Housing: 1800,
        'Food & Dining': 860,
        Technology: 1150,
        Travel: 450,
        Transport: 410,
        Discretionary: 310,
        total: 4980,
      },
      {
        month: 'Mar',
        fullMonth: 'March 2026',
        Housing: 1800,
        'Food & Dining': 910,
        Technology: 1300,
        Travel: 300,
        Transport: 430,
        Discretionary: 340,
        total: 5080,
      },
      {
        month: 'Apr',
        fullMonth: 'April 2026',
        Housing: 1800,
        'Food & Dining': 940,
        Technology: 1250,
        Travel: 650,
        Transport: 460,
        Discretionary: 390,
        total: 5490,
      },
      {
        month: 'May',
        fullMonth: 'May 2026',
        Housing: 1800,
        'Food & Dining': 920,
        Technology: 1180,
        Travel: 780,
        Transport: 450,
        Discretionary: 370,
        total: 5500,
      },
      {
        month: 'Jun',
        fullMonth: 'June 2026',
        Housing: 1800,
        'Food & Dining': 980,
        Technology: 1500,
        Travel: 1100,
        Transport: 490,
        Discretionary: 420,
        total: 6290,
      },
      {
        month: 'Jul',
        fullMonth: 'July 2026',
        Housing: 1800,
        'Food & Dining': 1020,
        Technology: 1220,
        Travel: 1450,
        Transport: 510,
        Discretionary: 460,
        total: 6460,
      },
      {
        month: 'Aug',
        fullMonth: 'August 2026',
        Housing: 1800,
        'Food & Dining': 970,
        Technology: 1350,
        Travel: 1320,
        Transport: 480,
        Discretionary: 410,
        total: 6330,
      },
      {
        month: 'Sep',
        fullMonth: 'September 2026',
        Housing: 1800,
        'Food & Dining': 890,
        Technology: 1420,
        Travel: 540,
        Transport: 440,
        Discretionary: 350,
        total: 5440,
      },
      {
        month: 'Oct',
        fullMonth: 'October 2026 (Current)',
        Housing: 1800,
        'Food & Dining': Math.round(liveFood),
        Technology: Math.round(liveTech),
        Travel: Math.round(liveTravel),
        Transport: Math.round(liveTransport),
        Discretionary: 300,
        total: Math.round(1800 + liveFood + liveTech + liveTravel + liveTransport + 300),
      },
    ];

    return data;
  }, [transactions]);

  // Filter based on timePeriod selection
  const filteredTrends = useMemo(() => {
    if (timePeriod === 'Last 6M') {
      return baseMonthlyTrends.slice(6);
    }
    if (timePeriod === 'YTD 2026') {
      return baseMonthlyTrends.slice(2);
    }
    return baseMonthlyTrends;
  }, [baseMonthlyTrends, timePeriod]);

  // Default displayed month in the inspection card is the latest or hovered
  const currentInspectMonth = hoveredDataPoint || filteredTrends[filteredTrends.length - 1];

  // Baseline values
  const netCashFlow = 24850.0;
  const totalIncome = 68400.0;
  const totalExpenses = filteredTrends.reduce((acc, curr) => acc + curr.total, 0);
  const savingsRate = '36.3%';

  // Categories list
  const categoryKeys = ['Housing', 'Food & Dining', 'Technology', 'Travel', 'Transport', 'Discretionary'];

  // Custom Interactive Tooltip Component
  const CustomTrendsTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataItem: MonthlyCategoryData = payload[0]?.payload;
    if (!dataItem) return null;

    return (
      <div className="bg-[#131b2e] text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-xs min-w-[240px] z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/15">
          <span className="font-bold text-sm text-white">{dataItem.fullMonth}</span>
          <span className="bg-[#6cf8bb]/20 text-[#6cf8bb] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {formatNumber(dataItem.total, currency)}
          </span>
        </div>

        <div className="text-[11px] text-[#bec6e0] mb-2 font-medium">Category Spending Breakdown:</div>

        <div className="flex flex-col gap-1.5">
          {categoryKeys.map((catKey) => {
            const catVal = Number(dataItem[catKey]) || 0;
            const pct = dataItem.total > 0 ? ((catVal / dataItem.total) * 100).toFixed(1) : '0';
            const color = CATEGORY_COLORS[catKey]?.stroke || '#ffffff';

            return (
              <div key={catKey} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                  <span className="text-[#d8dadc]">{catKey}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{formatNumber(catVal, currency)}</span>
                  <span className="text-[10px] text-[#76777d] w-9 text-right font-mono">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#76777d]">
          <span>Total Monthly Spend</span>
          <span className="text-white font-bold text-xs">{formatNumber(dataItem.total, currency)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Top Controls / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1e]">Financial Analytics</h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Comprehensive insights, trailing 12-month trends, and category breakdown telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-[#f2f4f6] rounded-xl p-1 border border-[#eceef0]">
            {(['Trailing 12M', 'Last 6M', 'YTD 2026'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timePeriod === period ? 'bg-white text-[#191c1e] shadow-xs' : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            onClick={() => onExportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-[#000000] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Hero KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 - Net Cash Flow */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#f2f4f6] rounded-full opacity-60 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Net Cash Flow</span>
            <span className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#006c49] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(netCashFlow, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-[#006c49] font-bold">+18.4%</span>
              <span className="text-[#45464d]">vs previous period</span>
            </div>
          </div>
        </div>

        {/* Card 2 - Total Income */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#f2f4f6] rounded-full opacity-60 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Total Income</span>
            <span className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#191c1e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(totalIncome, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-[#006c49] font-bold">+5.2%</span>
              <span className="text-[#45464d]">stable growth</span>
            </div>
          </div>
        </div>

        {/* Card 3 - Total Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#f2f4f6] rounded-full opacity-60 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Total Expenses</span>
            <span className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">
              {formatNumber(totalExpenses, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-[#ba1a1a] font-bold">-2.1%</span>
              <span className="text-[#45464d]">optimized spend</span>
            </div>
          </div>
        </div>

        {/* Card 4 - Savings Rate */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-[#c6c6cd] transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#f2f4f6] rounded-full opacity-60 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#45464d] uppercase tracking-wider">Savings Rate</span>
            <span className="p-1.5 rounded-lg bg-[#f2f4f6] text-[#006c49] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[#191c1e]">{savingsRate}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-[#006c49] font-bold">+4.1%</span>
              <span className="text-[#45464d]">target achieved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trailing 12-Month Trends Section with Recharts Integration */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#eceef0] flex flex-col gap-6">
        {/* Header with Title and Toggle Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#eceef0]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#191c1e]">Monthly Spending Trends (Last 12 Months)</h2>
              <span className="bg-[#6cf8bb]/30 text-[#00714d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                Interactive Recharts
              </span>
            </div>
            <p className="text-xs text-[#76777d] mt-0.5">
              Hover over any data point for detailed category breakdowns, spending velocity, and percentages.
            </p>
          </div>

          {/* Toggleable View Modes (Area, Stacked, Lines, Bars) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#76777d] mr-1">View Mode:</span>
            <div className="flex items-center bg-[#f2f4f6] rounded-xl p-1 border border-[#eceef0]">
              <button
                onClick={() => setChartMode('stacked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  chartMode === 'stacked'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Stacked Area Breakdown of all categories"
              >
                <span className="material-symbols-outlined text-[16px]">stacked_bar_chart</span>
                Stacked Composition
              </button>

              <button
                onClick={() => setChartMode('area')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  chartMode === 'area'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Total Monthly Spend Trajectory"
              >
                <span className="material-symbols-outlined text-[16px]">area_chart</span>
                Total Trend
              </button>

              <button
                onClick={() => setChartMode('lines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  chartMode === 'lines'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Category Lines comparison"
              >
                <span className="material-symbols-outlined text-[16px]">show_chart</span>
                Category Lines
              </button>

              <button
                onClick={() => setChartMode('bars')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  chartMode === 'bars'
                    ? 'bg-white text-[#191c1e] shadow-xs'
                    : 'text-[#45464d] hover:text-[#191c1e]'
                }`}
                title="Monthly Columns"
              >
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                Columns
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#76777d] font-semibold shrink-0">Focus:</span>
          <button
            onClick={() => setActiveCategoryFilter('All')}
            className={`px-3 py-1 rounded-full font-semibold transition-all shrink-0 ${
              activeCategoryFilter === 'All'
                ? 'bg-[#191c1e] text-white shadow-xs'
                : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'
            }`}
          >
            All Categories
          </button>
          {categoryKeys.map((catKey) => {
            const color = CATEGORY_COLORS[catKey]?.stroke || '#000';
            const isSelected = activeCategoryFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategoryFilter(catKey)}
                className={`px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#191c1e] text-white shadow-xs'
                    : 'bg-[#f2f4f6] text-[#45464d] hover:bg-[#e6e8ea]'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                {catKey}
              </button>
            );
          })}
        </div>

        {/* Recharts Main Canvas */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'area' ? (
              <AreaChart
                data={filteredTrends}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setHoveredDataPoint(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredDataPoint(null)}
              >
                <defs>
                  <linearGradient id="totalSpendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006c49" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#006c49" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#76777d"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#eceef0' }}
                />
                <YAxis
                  stroke="#76777d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencyConfig.symbol}${Math.round(val * rate)}`}
                />
                <Tooltip content={<CustomTrendsTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#006c49"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#totalSpendGrad)"
                  activeDot={{ r: 6, fill: '#006c49', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartMode === 'stacked' ? (
              <AreaChart
                data={filteredTrends}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setHoveredDataPoint(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredDataPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#76777d"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#eceef0' }}
                />
                <YAxis
                  stroke="#76777d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencyConfig.symbol}${Math.round(val * rate)}`}
                />
                <Tooltip content={<CustomTrendsTooltip />} />
                {categoryKeys.map((catKey) => {
                  const isDimmed = activeCategoryFilter !== 'All' && activeCategoryFilter !== catKey;
                  const color = CATEGORY_COLORS[catKey];
                  return (
                    <Area
                      key={catKey}
                      type="monotone"
                      dataKey={catKey}
                      stackId="1"
                      stroke={color.stroke}
                      strokeWidth={isDimmed ? 1 : 2}
                      fill={color.fill}
                      fillOpacity={isDimmed ? 0.15 : 0.75}
                      activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 1.5 }}
                    />
                  );
                })}
              </AreaChart>
            ) : chartMode === 'lines' ? (
              <LineChart
                data={filteredTrends}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setHoveredDataPoint(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredDataPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#76777d"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#eceef0' }}
                />
                <YAxis
                  stroke="#76777d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencyConfig.symbol}${Math.round(val * rate)}`}
                />
                <Tooltip content={<CustomTrendsTooltip />} />
                {categoryKeys.map((catKey) => {
                  const isFiltered = activeCategoryFilter !== 'All' && activeCategoryFilter !== catKey;
                  const color = CATEGORY_COLORS[catKey];
                  return (
                    <Line
                      key={catKey}
                      type="monotone"
                      dataKey={catKey}
                      stroke={color.stroke}
                      strokeWidth={isFiltered ? 1 : activeCategoryFilter === catKey ? 3.5 : 2}
                      strokeOpacity={isFiltered ? 0.2 : 1}
                      dot={{ r: isFiltered ? 1 : 3, fill: color.stroke }}
                      activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <BarChart
                data={filteredTrends}
                margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    setHoveredDataPoint(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={() => setHoveredDataPoint(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#76777d"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#eceef0' }}
                />
                <YAxis
                  stroke="#76777d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${currencyConfig.symbol}${Math.round(val * rate)}`}
                />
                <Tooltip content={<CustomTrendsTooltip />} />
                {categoryKeys.map((catKey) => {
                  const isDimmed = activeCategoryFilter !== 'All' && activeCategoryFilter !== catKey;
                  const color = CATEGORY_COLORS[catKey];
                  return (
                    <Bar
                      key={catKey}
                      dataKey={catKey}
                      stackId="a"
                      fill={color.fill}
                      fillOpacity={isDimmed ? 0.2 : 0.85}
                      radius={catKey === 'Discretionary' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  );
                })}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Live Hover Telemetry Inspection Bar */}
        <div className="bg-[#f7f9fb] p-4 rounded-xl border border-[#eceef0] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div>
              <div className="text-xs text-[#76777d]">
                Active Data Point: <strong className="text-[#191c1e]">{currentInspectMonth.fullMonth}</strong>
              </div>
              <div className="text-sm font-bold text-[#191c1e]">
                Total Month Spend: {formatNumber(currentInspectMonth.total, currency)}
              </div>
            </div>
          </div>

          {/* Quick chips showing category values for hovered month */}
          <div className="flex items-center gap-2 flex-wrap">
            {categoryKeys.map((catKey) => {
              const val = Number(currentInspectMonth[catKey]) || 0;
              const color = CATEGORY_COLORS[catKey]?.stroke || '#000';
              return (
                <div
                  key={catKey}
                  className="bg-white px-2.5 py-1 rounded-lg border border-[#eceef0] flex items-center gap-1.5 text-xs shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                  <span className="text-[#76777d]">{catKey}:</span>
                  <span className="font-semibold text-[#191c1e]">{formatNumber(val, currency)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid Section 1: Income vs Expenses & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Graph (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">Income vs Expenses (Fiscal Flow)</h2>
              <p className="text-xs text-[#45464d]">Monthly comparison over the current fiscal cycle</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#000000]"></span>
                <span className="text-xs text-[#45464d] font-medium">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#e0e3e5]"></span>
                <span className="text-xs text-[#45464d] font-medium">Expenses</span>
              </div>
            </div>
          </div>

          {/* Comparative Bar Chart using Recharts */}
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: 'Jan', Income: 9500, Expense: 6100 },
                  { month: 'Feb', Income: 11500, Expense: 6800 },
                  { month: 'Mar', Income: 8200, Expense: 5400 },
                  { month: 'Apr', Income: 12200, Expense: 8900 },
                  { month: 'May', Income: 10200, Expense: 6500 },
                  { month: 'Jun', Income: 13000, Expense: 7500 },
                ]}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f2f4f6" vertical={false} />
                <XAxis dataKey="month" stroke="#76777d" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#76777d"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${currencyConfig.symbol}${Math.round(v * rate)}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatNumber(Number(value), currency), '']}
                  contentStyle={{
                    backgroundColor: '#131b2e',
                    color: '#ffffff',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Income" fill="#000000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#c6c6cd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#76777d] pt-3 border-t border-[#eceef0] mt-3">
            <span>Fiscal Year Audit</span>
            <span className="text-[#006c49] font-medium">Average Net Surplus: +$4,141.60 / mo</span>
          </div>
        </div>

        {/* Category Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#191c1e]">Annual Distribution</h2>
            <p className="text-xs text-[#45464d]">Top expenditure allocations</p>
          </div>

          <div className="flex flex-col gap-4 my-6">
            {/* Item 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#000000]"></span>
                  <span className="font-semibold text-[#191c1e]">Housing & Utilities</span>
                </div>
                <span className="font-semibold text-[#191c1e]">
                  {formatNumber(21600, currency)} (32%)
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#000000] h-full rounded-full transition-all" style={{ width: '32%' }}></div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006c49]"></span>
                  <span className="font-semibold text-[#191c1e]">Food & Dining</span>
                </div>
                <span className="font-semibold text-[#191c1e]">
                  {formatNumber(11350, currency)} (22%)
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006c49] h-full rounded-full transition-all" style={{ width: '22%' }}></div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3980f4]"></span>
                  <span className="font-semibold text-[#191c1e]">Technology & SaaS</span>
                </div>
                <span className="font-semibold text-[#191c1e]">
                  {formatNumber(15490, currency)} (23%)
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#3980f4] h-full rounded-full transition-all" style={{ width: '23%' }}></div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  <span className="font-semibold text-[#191c1e]">Travel & Leisure</span>
                </div>
                <span className="font-semibold text-[#191c1e]">
                  {formatNumber(9885, currency)} (15%)
                </span>
              </div>
              <div className="w-full bg-[#f2f4f6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full transition-all" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenSearchModal()}
            className="w-full py-2.5 rounded-xl bg-[#f2f4f6] text-[#191c1e] text-xs font-semibold hover:bg-[#e6e8ea] transition-colors text-center flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            Compare with Market Benchmarks
          </button>
        </div>
      </div>

      {/* Export Data Options (Bottom) */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-[#eceef0] flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#191c1e]">Export Data & Statements</h2>
          <p className="text-xs text-[#45464d]">Generate secure feeds, CSV logs, or executive summaries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* Option 1 */}
          <div
            onClick={() => onExportReport('csv')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors cursor-pointer group border border-transparent hover:border-[#c6c6cd]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#191c1e] shadow-2xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#191c1e]">CSV Spreadsheet</div>
                <div className="text-[11px] text-[#76777d]">Raw 12-month transaction log</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#76777d] group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Option 2 */}
          <div
            onClick={() => onExportReport('pdf')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors cursor-pointer group border border-transparent hover:border-[#c6c6cd]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#006c49] shadow-2xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#191c1e]">Executive Summary</div>
                <div className="text-[11px] text-[#76777d]">PDF portfolio report & trends</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#76777d] group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </div>

          {/* Option 3 */}
          <div
            onClick={() => onExportReport('json')}
            className="flex items-center justify-between p-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] transition-colors cursor-pointer group border border-transparent hover:border-[#c6c6cd]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#45464d] shadow-2xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">code</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#191c1e]">JSON API Feed</div>
                <div className="text-[11px] text-[#76777d]">Structured timeseries data</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#76777d] group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#eceef0] text-xs">
          <span className="text-[#76777d]">Encrypted SSL 256-bit download</span>
          <button
            onClick={() => alert('API Access: Connected to Tracker Pro Real-time Ledger API (OAuth & SSL secured).')}
            className="font-semibold text-[#191c1e] underline hover:opacity-80"
          >
            Configure API Keys
          </button>
        </div>
      </div>
    </div>
  );
};
