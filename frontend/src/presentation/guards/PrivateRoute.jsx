import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@application-auth';
import AccessDeniedRedirect from '@navigation/components/AccessDeniedRedirect.jsx';
import { hasAnyPermiso } from '@navigation/utils/hasAnyPermiso.js';

export function PrivateRoute({
  permiso = null,
  permisoAny = null,
  accion = 'LISTAR',
  children = null,
}) {
  const { isAuthenticated, isLoading, hasPermiso } = useAuth();

  if (isLoading) {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permiso && !hasPermiso(permiso, accion ?? 'LISTAR')) {
    return (
      <AccessDeniedRedirect
        description="No tiene permiso para ver esta página."
      />
    );
  }

  if (!permiso && permisoAny?.length && !hasAnyPermiso(permisoAny, hasPermiso, accion ?? 'LISTAR')) {
    return (
      <AccessDeniedRedirect
        description="No tiene permiso para ver esta página."
      />
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}
