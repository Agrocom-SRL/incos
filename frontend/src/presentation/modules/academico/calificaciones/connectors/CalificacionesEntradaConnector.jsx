/**
 * Entrada del módulo: coordinación → vista general; docente → mis cursos.
 */

import { Spin } from 'antd';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { useCasesFactory } from '@container';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { MIS_CURSOS_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

const DocenteMisCursosRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      try {
        const uc = useCasesFactory.listarMisCursosCalificaciones();
        const result = await uc.ejecutar();
        if (!cancelled && result?.success) {
          navigate(MIS_CURSOS_PATH, { replace: true });
          return;
        }
        if (!cancelled) {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        if (!cancelled) navigate('/dashboard', { replace: true });
      }
    };

    cargar();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <Spin size="large" />
    </div>
  );
};

const CalificacionesEntradaConnector = () => {
  const { hasPermiso } = useAuth();

  if (hasPermiso(CALIFICACIONES_PERMISOS.coordinacion, 'LISTAR')) {
    return <CoordinacionPage />;
  }

  if (hasPermiso(CALIFICACIONES_PERMISOS.misCursos, 'LISTAR')) {
    return <DocenteMisCursosRedirect />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default CalificacionesEntradaConnector;
