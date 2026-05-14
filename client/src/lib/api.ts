/**
 * API Client - Centralized HTTP client with auth token handling
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('ai_interview_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const api = {
  // ─── Auth ──────────────────────────────────────────────
  auth: {
    register: async (body: { name: string; email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    },

    login: async (body: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    },

    profile: async () => {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // ─── Interviews ────────────────────────────────────────
  interviews: {
    uploadCV: async (formData: FormData) => {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('ai_interview_token') : null;
      const res = await fetch(`${API_BASE}/interviews/upload-cv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      return handleResponse(res);
    },

    sendMessage: async (sessionId: string, message: string) => {
      const res = await fetch(`${API_BASE}/interviews/${sessionId}/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      return handleResponse(res);
    },

    finish: async (sessionId: string) => {
      const res = await fetch(`${API_BASE}/interviews/${sessionId}/finish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    getAll: async () => {
      const res = await fetch(`${API_BASE}/interviews`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    getOne: async (sessionId: string) => {
      const res = await fetch(`${API_BASE}/interviews/${sessionId}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },
};
