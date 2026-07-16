/**
 * Entrada del ítem Docentes (lazy) — conector por rol.
 *
 * - Rol DOCENTE → NO ve el listado: se resuelve su propio id en servidor
 *   (`/docentes/mis-datos`, mismo patrón portal que Historial/estudiante) y se
 *   redirige a su ficha. La etiqueta de menú ya es "Mi ficha" (labelByRole).
 * - Staff/admin → lista de docentes (permiso LISTAR) con sus providers.
 */

import { Navigate } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { useAuth, esDocente } from '@application-auth';
import { useMiDocenteId } from '@application-docentes/hooks';
import { DocentesListProvider } from '@application-docentes/providers';
import DocentesList from '@docentes/pages/DocentesList';

/** Rama DOCENTE: resuelve su id y redirige a su propia ficha. */
const MiFichaDocenteRedirect = () => {
  const { docenteId, loading, error } = useMiDocenteId();

  if (loading) {
    return <Spin spinning size="large" tip="Abriendo su ficha…" style={{ width: '100%' }} />;
  }
  if (error || !docenteId) {
    return (
      <Alert
        type="error"
        showIcon
        title="No se pudo abrir su ficha"
        description={error || 'No se encontró su registro de docente.'}
        style={{ margin: 'var(--spacing-lg)' }}
      />
    );
  }
  return <Navigate to={`/docentes/${docenteId}`} replace />;
};

const DocentesListConnector = () => {
  const { usuario } = useAuth();

  if (esDocente(usuario)) {
    return <MiFichaDocenteRedirect />;
  }

  return (
    <DocentesListProvider>
      <DocentesList />
    </DocentesListProvider>
  );
};

export default DocentesListConnector;
