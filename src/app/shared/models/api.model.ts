export interface ApiErrorResponse {
  status: number;
  message: string;
  details?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
