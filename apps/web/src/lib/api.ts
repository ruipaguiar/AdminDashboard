import axios from "axios";

/**
 * Cliente HTTP para chamadas client-side à API.
 * Como o Next.js faz rewrite de /api/* → API C#, o baseURL é só "/api".
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar JWT do NextAuth quando disponível
api.interceptors.request.use(async (config) => {
  // TODO: integrar com NextAuth getSession() quando estiver implementado
  return config;
});

// Interceptor para tratar 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirect para /login
    }
    return Promise.reject(error);
  }
);
