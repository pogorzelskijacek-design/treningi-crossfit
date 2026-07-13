import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { RepositoryProvider } from '@/context/RepositoryProvider';
import { AuthProvider, useAuth } from '@/context/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DashboardPage } from '@/pages/DashboardPage';
import { GenerateWorkoutPage } from '@/pages/GenerateWorkoutPage';
import { LogWorkoutPage } from '@/pages/LogWorkoutPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ExerciseCatalogPage } from '@/pages/ExerciseCatalogPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { AuthPage } from '@/pages/AuthPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="generate" element={<GenerateWorkoutPage />} />
          <Route path="generate/log/:generatedWorkoutId" element={<LogWorkoutPage />} />
          <Route path="exercises" element={<ExerciseCatalogPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/** With Supabase configured, require a signed-in session before the app + data layer mount. */
function AuthenticatedApp() {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-svh bg-background" />;
  if (!session) return <AuthPage />;
  return (
    <RepositoryProvider>
      <AppRoutes />
    </RepositoryProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      {isSupabaseConfigured ? (
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      ) : (
        <RepositoryProvider>
          <AppRoutes />
        </RepositoryProvider>
      )}
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
