// Configuração da API com fallback em runtime
const PRIMARY_BASE_URL = 'https://api.admoving.demo.addirceu.com.br';
const FALLBACK_BASE_URL = 'http://127.0.0.1:8000';

export const API_CONFIG = {
  PRIMARY_BASE_URL,
  FALLBACK_BASE_URL,
  SECRET: (import.meta as any).env?.VITE_API_SECRET || 'troque-essa-por-uma-chave-secreta',
};

// Função para criar headers com autenticação
export const createAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
};

// Função para fazer requisições autenticadas
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const defaultOptions: RequestInit = { headers: createAuthHeaders() };
  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...(options.headers || {}) },
  };

  // Tentativa no host primário com timeout curto; fallback para localhost
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${API_CONFIG.PRIMARY_BASE_URL}${endpoint}`, {
      ...mergedOptions,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (_) {
    // Fallback: localhost
    return fetch(`${API_CONFIG.FALLBACK_BASE_URL}${endpoint}`, mergedOptions);
  }
};
