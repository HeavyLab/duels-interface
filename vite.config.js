import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
            manifestFilename: 'manifest.json',
            filename: 'sw.js',
            manifest: {
                name: 'Duels Interface',
                short_name: 'Duels',
                description: 'Local-first duel sandbox for testing two-player combat rules',
                start_url: '.',
                scope: '.',
                display: 'standalone',
                orientation: 'landscape',
                background_color: '#111827',
                theme_color: '#111827',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
                navigateFallback: 'index.html'
            }
        })
    ],
    server: {
        host: true,
        port: 5173
    }
});
