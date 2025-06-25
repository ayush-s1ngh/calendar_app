import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LoadingProvider } from './components/LoadingIndicator';
import { QueryClient, QueryClientProvider, Query } from '@tanstack/react-query';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './AppRoutes';
import { defaultQueryOptions } from './utils/queryConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Safely typed event listener
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated') {
    const query = event.query as Query;

    if (query.state.status === 'error') {
      console.error('Global query error:', query.state.error);
    }
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <LoadingProvider>
                  <AppRoutes />
                </LoadingProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;