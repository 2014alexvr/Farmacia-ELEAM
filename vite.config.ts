import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ESTRATEGIA DE ACTUALIZACIÓN AUTOMÁTICA
      registerType: 'autoUpdate', 
      
      // CONFIGURACIÓN DE WORKBOX (EL CEREBRO DEL SERVICE WORKER)
      workbox: {
        // Patrones de archivos a cachear
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        
        // FORZAR ACTUALIZACIÓN INMEDIATA
        cleanupOutdatedCaches: true, // Borra cachés viejos
        skipWaiting: true,           // El nuevo SW toma el control inmediatamente, no espera
        clientsClaim: true,          // El nuevo SW controla las pestañas abiertas inmediatamente
      },

      // CONFIGURACIÓN DEL MANIFIESTO (Definido aquí para versionado automático)
      manifest: {
        name: "Farmacia ELEAM El Nazareno",
        short_name: "Farmacia ELEAM",
        description: "Gestión de medicamentos para ELEAM",
        start_url: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#0d9488",
        orientation: "any", // CRÍTICO: Permite rotación (Landscape/Portrait)
        icons: [
          {
            src: "/icono-farmacia.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icono-farmacia.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      
      // Archivos estáticos a incluir siempre
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icono-farmacia.png'],
      
      devOptions: {
        enabled: true // Habilitar PWA en desarrollo para pruebas
      }
    })
  ],
})