// Configuração da API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  SECRET: import.meta.env.VITE_API_SECRET || 'troque-essa-por-uma-chave-secreta', // Fallback somente para dev local
};

// Função para criar headers com autenticação
export const createAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-API-KEY': API_CONFIG.SECRET,
    ...additionalHeaders,
  };
};

// Função para fazer requisições autenticadas
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: createAuthHeaders(),
  };

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  return fetch(url, mergedOptions);
};
