import {
  CreateUrlPayload,
  HealthReport,
  LoginPayload,
  ProblemDetails,
  RegisterPayload,
  TokenResponse,
  URLItem,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  }

  public setSession(accessToken: string, refreshToken: string, userId?: number, role?: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (userId !== undefined) {
      localStorage.setItem('user_id', userId.toString());
    }
    if (role !== undefined) {
      localStorage.setItem('user_role', role);
    }
  }

  public clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401 = true
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const token = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 401 Unauthorized with token refresh rotation
    if (response.status === 401 && retryOn401 && this.getRefreshToken() && this.getUserId()) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const refreshRes = await this.refreshToken({
            refreshToken: this.getRefreshToken()!,
            userId: this.getUserId()!,
          });

          this.setSession(refreshRes.accessToken, refreshRes.refreshToken);
          this.isRefreshing = false;
          this.onRefreshed(refreshRes.accessToken);

          // Retry current request with new token
          return this.request<T>(endpoint, options, false);
        } catch (refreshErr) {
          this.isRefreshing = false;
          this.clearSession();
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new Error('Session expired. Please log in again.');
        }
      } else {
        // Wait for token refresh in progress
        return new Promise<T>((resolve, reject) => {
          this.subscribeTokenRefresh(async () => {
            try {
              const res = await this.request<T>(endpoint, options, false);
              resolve(res);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData: ProblemDetails = await response.json();
        errorMessage = errorData.detail || errorData.title || errorMessage;
      } catch {
        // Response was not JSON
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // --- Auth Endpoints ---
  async login(payload: LoginPayload): Promise<TokenResponse> {
    return this.request<TokenResponse>('/api/Auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async refreshToken(payload: { refreshToken: string; userId: number }): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/api/Auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    return res.json();
  }

  // --- User Endpoints ---
  async register(payload: RegisterPayload): Promise<User> {
    return this.request<User>('/api/User/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/User', {
      method: 'GET',
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.request<User>(`/api/User/email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
  }

  async updateUser(user: Partial<User> & { id: number }): Promise<void> {
    return this.request<void>('/api/User', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(email: string): Promise<void> {
    return this.request<void>(`/api/User/id?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
  }

  // --- URL Endpoints ---
  async getMyUrls(): Promise<URLItem | URLItem[]> {
    // Note: GET /api/Url/myUrls in the backend returns URLs with clicks
    return this.request<URLItem | URLItem[]>('/api/Url/myUrls', {
      method: 'GET',
    });
  }

  async getAllUrls(): Promise<URLItem[]> {
    return this.request<URLItem[]>('/api/Url', {
      method: 'GET',
    });
  }

  async createUrl(payload: CreateUrlPayload): Promise<URLItem> {
    return this.request<URLItem>('/api/Url', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateUrl(url: URLItem): Promise<URLItem> {
    return this.request<URLItem>('/api/Url', {
      method: 'PUT',
      body: JSON.stringify(url),
    });
  }

  async deleteUrl(id: number): Promise<void> {
    return this.request<void>(`/:${id}`, {
      method: 'DELETE',
    });
  }

  // --- Health Endpoint ---
  async getHealth(): Promise<HealthReport> {
    const res = await fetch(`${API_BASE}/health`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Health probe returned status ${res.status}`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
