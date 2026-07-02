/**
 * Entrada del Historial académico (lazy).
 *
 * - Rol ESTUDIANTE → NO ve selector: se resuelve su propio id en servidor
 *   (`/estudiantes/mis-datos`, patrón portal `resolveEstudianteIdForUsuario`) y se
 *   redirige a su historial. La etiqueta de menú ya es "Mi historial".
 * - Staff/docente → selector/buscador de estudiante (permiso LISTAR).
 */

import { Navigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useAuth, esEstudiante } from '@application-auth';
import { useMiEstudianteId } from '@application-academico/historial/hooks/api/useMiEstudianteId.js';
import { historialAcademicoPath } from '@application-academico/historial/utils/historialPaths.js';
import HistorialSelectorPage from '../pages/HistorialSelectorPage.jsx';

/** Rama ESTUDIANTE: resuelve su id y redirige a su propio transcript. */
const MiHistorialRedirect = () => {
  const { estudianteId, loading, error } = useMiEstudianteId();

  if (loading) {
    return <Spin spinning size="large" tip="Abriendo tu historial…" style={{ width: '100%' }} />;
  }
  if (error || !estudianteId) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudo abrir tu historial"
        description={error || 'No se encontró tu registro de estudiante.'}
        style={{ margin: 'var(--spacing-lg)' }}
      />
    );
  }
  return <Navigate to={historialAcademicoPath(estudianteId)} replace />;
};

const HistorialSelectorConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <MiHistorialRedirect />;
  }

  return <HistorialSelectorPage />;
};

export default HistorialSelectorConnector;
