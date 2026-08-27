export interface User {
  id: number;
  userName: string;
  email: string;
  role: 'Admin' | 'User' | string;
}

export interface ClickItem {
  clickId: number;
  urlId: number;
  dateClicke: string;
  referrer?: string | null;
  ipAddress?: string | null;
}

export interface URLItem {
  id: number;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  userId?: number;
  user?: User | null;
  clicks?: ClickItem[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  accessToken?: string;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateUrlPayload {
  url: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}

export interface HealthResult {
  status: string;
  description?: string | null;
  data?: Record<string, unknown>;
}

export interface HealthReport {
  status: string;
  results?: Record<string, HealthResult>;
}
