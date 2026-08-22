import { api } from './api';
import type {
  ChartOfAccount,
  CreateChartOfAccountRequest,
  FinancialPeriod,
  JournalEntry,
  CreateJournalEntryRequest,
  TrialBalanceReport,
  IncomeStatementReport,
  BalanceSheetReport,
  AccountLedgerStatementReport,
  PageResponse
} from '../models/types';

export const financeService = {
  // ==========================================
  // 1. CHART OF ACCOUNTS
  // ==========================================

  /**
   * Fetch all chart of accounts for the current store context.
   * @param activeOnly default is true
   */
  async getChartOfAccounts(activeOnly = false): Promise<ChartOfAccount[]> {
    const endpoint = `/api/chart-of-accounts?activeOnly=${activeOnly}`;
    return api.get<ChartOfAccount[]>(endpoint);
  },

  /**
   * Fetch account details by account code.
   */
  async getAccountByCode(code: string): Promise<ChartOfAccount> {
    return api.get<ChartOfAccount>(`/api/chart-of-accounts/${encodeURIComponent(code)}`);
  },

  /**
   * Create a new custom Chart of Account.
   */
  async createAccount(request: CreateChartOfAccountRequest): Promise<ChartOfAccount> {
    return api.post<ChartOfAccount>('/api/chart-of-accounts', request);
  },

  // ==========================================
  // 2. FINANCIAL PERIODS
  // ==========================================

  /**
   * Get list of all financial periods for the store.
   */
  async getFinancialPeriods(): Promise<FinancialPeriod[]> {
    return api.get<FinancialPeriod[]>('/api/financial-periods');
  },

  /**
   * Get the currently active open financial period (or automatically ensures one for today).
   */
  async getCurrentPeriod(): Promise<FinancialPeriod> {
    return api.get<FinancialPeriod>('/api/financial-periods/current');
  },

  /**
   * Close a financial period by ID.
   */
  async closePeriod(periodId: string): Promise<FinancialPeriod> {
    return api.post<FinancialPeriod>(`/api/financial-periods/${periodId}/close`);
  },

  // ==========================================
  // 3. FINANCIAL REPORTS & STATEMENTS
  // ==========================================

  /**
   * Generate Trial Balance as of a specified date.
   */
  async getTrialBalance(params?: { asOfDate?: string; branchId?: string }): Promise<TrialBalanceReport> {
    const query = new URLSearchParams();
    if (params?.asOfDate) query.append('asOfDate', params.asOfDate);
    if (params?.branchId) query.append('branchId', params.branchId);

    const qs = query.toString();
    const endpoint = `/api/financial-reports/trial-balance${qs ? `?${qs}` : ''}`;
    return api.get<TrialBalanceReport>(endpoint);
  },

  /**
   * Generate Income Statement (Profit & Loss) for a date range.
   */
  async getIncomeStatement(params?: { startDate?: string; endDate?: string; branchId?: string }): Promise<IncomeStatementReport> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.branchId) query.append('branchId', params.branchId);

    const qs = query.toString();
    const endpoint = `/api/financial-reports/income-statement${qs ? `?${qs}` : ''}`;
    return api.get<IncomeStatementReport>(endpoint);
  },

  /**
   * Generate Balance Sheet as of a specified date.
   */
  async getBalanceSheet(params?: { asOfDate?: string; branchId?: string }): Promise<BalanceSheetReport> {
    const query = new URLSearchParams();
    if (params?.asOfDate) query.append('asOfDate', params.asOfDate);
    if (params?.branchId) query.append('branchId', params.branchId);

    const qs = query.toString();
    const endpoint = `/api/financial-reports/balance-sheet${qs ? `?${qs}` : ''}`;
    return api.get<BalanceSheetReport>(endpoint);
  },

  /**
   * Get detailed general ledger statement for a specific account.
   */
  async getAccountStatement(accountId: string, params?: { startDate?: string; endDate?: string }): Promise<AccountLedgerStatementReport> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    const qs = query.toString();
    const endpoint = `/api/financial-reports/account-statement/${accountId}${qs ? `?${qs}` : ''}`;
    return api.get<AccountLedgerStatementReport>(endpoint);
  },

  // ==========================================
  // 4. GENERAL LEDGER & JOURNAL ENTRIES
  // ==========================================

  /**
   * Get paginated journal entries list with filters.
   */
  async getJournalEntries(params?: {
    branchId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<JournalEntry>> {
    const query = new URLSearchParams();
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    query.append('page', (params?.page ?? 0).toString());
    query.append('size', (params?.size ?? 15).toString());

    return api.get<PageResponse<JournalEntry>>(`/api/ledger/entries?${query.toString()}`);
  },

  /**
   * Get single journal entry with complete double-entry lines by ID.
   */
  async getJournalEntryById(id: string): Promise<JournalEntry> {
    return api.get<JournalEntry>(`/api/ledger/entries/${id}`);
  },

  /**
   * Create and post a manual balanced journal entry.
   */
  async createJournalEntry(request: CreateJournalEntryRequest): Promise<JournalEntry> {
    return api.post<JournalEntry>('/api/ledger/entries', request);
  }
};
