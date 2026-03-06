import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import UnitsPage from './pages/UnitsPage'
import ExercisePage from './pages/ExercisePage'
import InterviewSetupPage from './pages/InterviewSetupPage'
import InterviewSessionPage from './pages/InterviewSessionPage'
import InterviewHistoryPage from './pages/InterviewHistoryPage'
import InterviewReviewPage from './pages/InterviewReviewPage'
import AdminQuestionsPage from './pages/AdminQuestionsPage'
import QuestionTransferPage from './pages/QuestionTransferPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/units/:unit/:exercise" element={<ExercisePage />} />
            <Route path="/interview/new" element={<InterviewSetupPage />} />
            <Route path="/interview/:sessionId" element={<InterviewSessionPage />} />
            <Route path="/interview/history" element={<InterviewHistoryPage />} />
            <Route path="/interview/history/:sessionId" element={<InterviewReviewPage />} />
            <Route path="/admin/questions" element={<AdminQuestionsPage />} />
            <Route path="/questions/transfer" element={<QuestionTransferPage />} />
            <Route path="/import-export" element={<Navigate to="/questions/transfer" replace />} />
            <Route path="/questions/import-export" element={<Navigate to="/questions/transfer" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
