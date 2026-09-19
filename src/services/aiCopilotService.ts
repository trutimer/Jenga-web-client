import { apiRequest } from './api';

export interface InvestigationStep {
  tool: string;
  summary: string;
}

export interface AiChatResponse {
  answer: string;
  investigationTrace: InvestigationStep[];
  model: string;
}

export interface ChatHistoryItem {
  sender: 'user' | 'assistant';
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  trace?: InvestigationStep[];
  model?: string;
  timestamp: Date;
  isError?: boolean;
}

export const aiCopilotService = {
  /**
   * Sends a conversational query to Jenga AI Assistant with optional conversational history.
   */
  async ask(message: string, storeBranchId?: string | null, history?: ChatHistoryItem[]): Promise<AiChatResponse> {
    const branchParam = storeBranchId ? `?storeBranchId=${encodeURIComponent(storeBranchId)}` : '';
    return await apiRequest<AiChatResponse>(`/api/ai/chat${branchParam}`, {
      method: 'POST',
      body: JSON.stringify({ message, history })
    });
  },

  /**
   * Runs an instant 1-click executive business health audit.
   */
  async getHealthSummary(storeBranchId?: string | null): Promise<AiChatResponse> {
    const branchParam = storeBranchId ? `?storeBranchId=${encodeURIComponent(storeBranchId)}` : '';
    return await apiRequest<AiChatResponse>(`/api/ai/health-summary${branchParam}`, {
      method: 'GET'
    });
  }
};
