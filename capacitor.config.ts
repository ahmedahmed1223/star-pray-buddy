import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0206c376d9e840e08b31355a2abed913',
  appName: 'star-pray-buddy',
  webDir: 'dist',
  server: {
    url: 'https://0206c376-d9e8-40e0-8b31-355a2abed913.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#141a2e',
      showSpinner: false,
      launchAutoHide: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#141a2e',
    },
  },
};

export default config;
