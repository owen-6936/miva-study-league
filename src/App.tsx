import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes';
import { useThemeStore } from '@/lib/stores/theme-store';
import { useAuthStore } from '@/lib/stores/auth-store';
// import { connectSocket, disconnectSocket } from './lib/socket';

const App = () => {
  useThemeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    //  is handled by zustand persist
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // connectSocket();
    } else {
      // disconnectSocket();
    }
    return () => {
      // disconnectSocket();
    };
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
};

export default App;
