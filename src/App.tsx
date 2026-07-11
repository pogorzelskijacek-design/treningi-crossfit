import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/sonner';
import { RepositoryProvider } from '@/context/RepositoryProvider';
import { DashboardPage } from '@/pages/DashboardPage';
import { GenerateWorkoutPage } from '@/pages/GenerateWorkoutPage';
import { LogWorkoutPage } from '@/pages/LogWorkoutPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { ProfilePage } from '@/pages/ProfilePage';

function App() {
  return (
    <ThemeProvider>
      <RepositoryProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="generate" element={<GenerateWorkoutPage />} />
              <Route path="generate/log/:generatedWorkoutId" element={<LogWorkoutPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </RepositoryProvider>
    </ThemeProvider>
  );
}

export default App;
