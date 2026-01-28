/// <reference types="vite/client" />

interface Window {
    fbq: (type: string, name: string, data?: unknown) => void;
}
