import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuthStore from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import CampaignPage from './pages/CampaignPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import LogsPage from './pages/LogsPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuthStore();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => { loadUser(); }, [loadUser]);

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="campaigns" element={<CampaignPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
