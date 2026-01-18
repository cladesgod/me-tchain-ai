import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://localhost:8000',
                ws: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
                    'ui-vendor': ['framer-motion', 'lucide-react', 'clsx'],
                    'i18n': ['i18next', 'react-i18next'],
                    // Feature-based chunks
                    'game': [
                        '@/components/game/GameCanvas',
                        '@/components/game/CharacterController',
                        '@/components/game/IsometricCamera',
                        '@/components/game/TimelineObject',
                    ],
                },
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
                    return `assets/js/${facadeModuleId}-[hash].js`;
                },
            },
        },
        // Increase chunk size warning limit for 3D assets
        chunkSizeWarningLimit: 1000, // 1MB
    },
});
