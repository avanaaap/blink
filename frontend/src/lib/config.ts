export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  apiTimeoutMs: 10000,
};

export const hasApiBaseUrl = Boolean(config.apiBaseUrl);
