/**
 * PublicRoute - Componente para rutas públicas (solo accesibles si NO está autenticado)
 * 
 * Single Responsibility: Redirigir a dashboard si ya está autenticado
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Guard de navegación para rutas públicas
 * - Depende de: useAuthContext (Application Layer)
 * 
 * Funcionalidad:
 * - Si NO está autenticado: renderiza children (página de login)
 * - Si está autenticado: redirige a /dashboard
 */

import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthContext } from '@application-auth';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Si está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, renderizar children (página de login)
  return children;
};
