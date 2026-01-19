/**
 * AuthGuard - Componente guard para proteger rutas
 * 
 * Single Responsibility: Verificar autenticación y redirigir si es necesario
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Guard de navegación
 * - Depende de: useAuthContext (Application Layer)
 * 
 * Funcionalidad:
 * - Si está autenticado: renderiza children
 * - Si no está autenticado: redirige a /login
 * - Muestra loading mientras verifica autenticación
 */

import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthContext } from '@application-auth';

export const AuthGuard = ({ children }) => {
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

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar children
  return children;
};
