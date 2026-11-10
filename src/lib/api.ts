
export const API_BASE_URL = 'http://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export const api = {
  getDisputes: () => request<{ disputes: any[] }>('/disputes'),
  getResults: () => request<any>('/results'),
  getCase: (id: string) => request<any>(`/disputes/${id}/case`),
  getAudit: (id: string) => request<{ entries: any[] }>(`/disputes/${id}/audit`),
  scoreDispute: (id: string) => request<any>(`/disputes/${id}/score`, { method: 'POST' }),
  draftDispute: (id: string) => request<any>(`/disputes/${id}/draft`, { method: 'POST' }),
  editDraft: (id: string, body: { sentences: any[], edited_by: string }) =>
    request<any>(`/disputes/${id}/draft/edit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  approveDraft: (id: string, body: { approved_by: string }) =>
    request<any>(`/disputes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  submitDispute: (id: string, body: { submitted_by: string }) =>
    request<any>(`/disputes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
