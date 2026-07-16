/**
 * MatriculaRedirect — al entrar a "Matrículas" (ítem de menú Matrícula), el ESTUDIANTE
 * se redirige al detalle de SU propia inscripción: `/inscripciones/:id`, reutilizando la
 * pantalla InscripcionesDetail (mismo patrón que Admisión → `/estudiantes/:id` y
 * Aportes → `/pagos/:id`). El backend blinda `/inscripciones/:id` a la propia (anti-IDOR).
 *
 * El id de inscripción sale de `GET /estudiantes/mis-datos` (inscripcion.enrollment.id).
 */

import { Navigate } from 'react-router-dom';
import { Spin, Alert, Empty } from 'antd';
import { useMisDatosEstudiante } from '@/application/modules/perfil/hooks/state/useMisDatosEstudiante.js';

const MatriculaRedirect = () => {
  const { misDatos, loadingMisDatos, errorMisDatos } = useMisDatosEstudiante(true);
  const inscripcionId = misDatos?.inscripcion?.enrollment?.id ?? null;

  if (inscripcionId) {
    return <Navigate to={`/inscripciones/${inscripcionId}`} replace />;
  }

  if (loadingMisDatos) {
    return (
      <Spin spinning tip="Abriendo su matrícula…">
        <div style={{ minHeight: 160 }} aria-hidden />
      </Spin>
    );
  }

  if (errorMisDatos) {
    return (
      <Alert type="warning" showIcon title="No se pudo abrir su matrícula" description={errorMisDatos} />
    );
  }

  return <Empty description="Aún no tiene una matrícula registrada en la gestión vigente." />;
};

export default MatriculaRedirect;
