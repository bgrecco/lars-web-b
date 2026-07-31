function isTruthyEnvValue(value: string | undefined) {
  return value !== undefined && ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export const shouldUseMockCatalog = isTruthyEnvValue(import.meta.env.VITE_LARS_USE_MOCK_DATA);
export const canUseMockCatalogFallback = import.meta.env.DEV || shouldUseMockCatalog;
