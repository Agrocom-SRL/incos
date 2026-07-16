/**
 * Conector: entrada del ítem Institucional → Oferta Académica (role-aware).
 *
 * Rama docente self (ítem relabelado "Mis asignaciones" vía labelByRole): el
 * DOCENTE no ve el dashboard administrativo de oferta; se resuelve su id en
 * servidor (`useMiDocenteId`) y se redirige a SUS asignaciones
 * (`DocenteAsignacionesPage`, solo lectura — el backend restringe por id).
 * El resto de roles ve el dashboard administrativo sin cambios.
 */

import { Navigate } from 'react-router-dom';
import { Alert, Flex, Spin } from 'antd';
import { useAuth, esDocente } from '@application-auth';
import { useMiDocenteId } from '@application-docentes/hooks/api/useMiDocenteId.js';
import { ofertaPaths } from '@application-institucional/oferta';
import OfertaAcademicaDashboardPage from '../pages/OfertaAcademicaDashboardPage';

/** Rama DOCENTE: spinner mientras se resuelve su id → Navigate a sus asignaciones. */
const OfertaDocenteAsignacionesRedirect = () => {
  const { docenteId, loading, error } = useMiDocenteId();

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '40vh' }}>
        <Spin size="large" tip="Identificando su registro de docente…">
          <span aria-hidden style={{ display: 'block', minWidth: 200, minHeight: 60 }} />
        </Spin>
      </Flex>
    );
  }

  if (error || !docenteId) {
    return (
      <Alert
        type="warning"
        showIcon
        title="No se pudo identificar su registro de docente"
        description={error || 'Vuelva a intentarlo o contacte con administración.'}
      />
    );
  }

  return (
    <Navigate
      to={ofertaPaths.docenteAsignaciones(docenteId)}
      replace
      // "Volver" de la página de asignaciones regresa al inicio del docente
      // (no a OFERTA_BASE, que lo redirigiría de nuevo aquí).
      state={{ returnListPath: '/dashboard' }}
    />
  );
};

const OfertaDashboardConnector = () => {
  const { usuario } = useAuth();

  if (esDocente(usuario)) {
    return <OfertaDocenteAsignacionesRedirect />;
  }

  return <OfertaAcademicaDashboardPage />;
};

export default OfertaDashboardConnector;
