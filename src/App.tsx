import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PoliciesPage } from './pages/PoliciesPage';
import { Layout } from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/useAuth';
import { ProtectedRoute } from './components/ProtectedRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/policies"
                element={
                  <ProtectedRoute>
                    <PoliciesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}