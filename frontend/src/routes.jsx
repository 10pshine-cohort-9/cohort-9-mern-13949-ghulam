import { Navigate, useRoutes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import authService from './services/auth.service';

const AppRoutes = () => {
  return useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: authService.getToken() ? <Dashboard /> : <Navigate to="/login" replace />
        }
      ]
    },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <Signup /> }
  ]);
};

export default AppRoutes;
