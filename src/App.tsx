import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { LessonProvider } from './contexts/LessonContext';
import LandingPage from './components/landing/LandingPage';
import AppShell from './components/layout/AppShell';

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
                <GamificationProvider>
                  <LessonProvider>
                    <AppShell />
                  </LessonProvider>
                </GamificationProvider>
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
