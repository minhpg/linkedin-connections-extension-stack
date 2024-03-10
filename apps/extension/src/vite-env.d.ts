/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VERCEL_URL: string;
  readonly PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
