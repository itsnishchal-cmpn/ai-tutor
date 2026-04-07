import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProgressProvider } from './contexts/ProgressContext';
import LandingPage from './components/landing/LandingPage';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { name } = useUser();
  if (!name) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <ChatProvider>
              <ProgressProvider>
                <AppLayout />
              </ProgressProvider>
            </ChatProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}
