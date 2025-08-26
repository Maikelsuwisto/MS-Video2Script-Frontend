/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  // add more custom env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
