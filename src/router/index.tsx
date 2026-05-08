import { useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";

import { PublicLayout } from "../app/components/layout/PublicLayout";

import { HomePage } from "../app/pages/HomePage";
import { RegistrationPage } from "../app/pages/RegistrationPage";
import { CareerPage } from "../app/pages/CareerPage";
import { ArticlesPage } from "../app/pages/ArticlesPage";
import { ArticleDetailPage } from "../app/pages/ArticleDetailPage";

import { LoginAdmin } from "../app/pages/admin/LoginAdmin";
import { CandidatesPage } from "../app/pages/admin/CandidatesPage";
import { StudentsPage } from "../app/pages/admin/StudentsPage";
import { AdminArticlesPage } from "../app/pages/admin/AdminArticlesPage";
import { SettingsPage } from "../app/pages/admin/SettingsPage";

import { CMSLayout } from "../app/components/admin/CMSLayout";
import { ProtectedRoute } from "../app/components/ProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/daftar" element={<RegistrationPage />} />
          <Route path="/karir" element={<CareerPage />} />
          <Route path="/artikel" element={<ArticlesPage />} />
          <Route path="/artikel/:id" element={<ArticleDetailPage />} />
        </Route>

        <Route path="/loginadmin" element={<LoginAdmin />} />

        <Route
          path="/cms"
          element={
            <ProtectedRoute>
              <CMSLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="candidates" replace />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
