/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_ENTERPRISE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}