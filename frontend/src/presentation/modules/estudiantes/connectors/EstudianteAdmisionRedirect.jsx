/**
 * EstudianteAdmisionRedirect — al entrar a "Admisión" (ítem de menú Matrícula),
 * el ESTUDIANTE se redirige al detalle de SU propia ficha: `/estudiantes/:id`,
 * con el id recuperado de la sesión (`usuario.vinculo_perfil.referencia_id`).
 *
 * Así se reutiliza la pantalla de detalle existente (EstudiantesDetail) en vez de
 * una página propia. Si el id aún no viene en la sesión, cae a `GET /estudiantes/mis-datos`
 * para obtenerlo. El backend blinda `/estudiantes/:id` al propio id (anti-IDOR).
 */

import { Navigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useAuth } from '@application-auth';
import { useMisDatosEstudiante } from '@/application/modules/perfil/hooks/state/useMisDatosEstudiante.js';

const EstudianteAdmisionRedirect = () => {
  const { usuario } = useAuth();
  const idSesion = usuario?.vinculo_perfil?.referencia_id ?? null;

  // Fallback: solo se activa (enabled) si la sesión todavía no trae el id.
  const { misDatos, loadingMisDatos, errorMisDatos } = useMisDatosEstudiante(!idSesion);
  const idFicha = misDatos?.student?.id ?? null;

  const estudianteId = idSesion ?? idFicha;

  if (estudianteId) {
    return <Navigate to={`/estudiantes/${estudianteId}`} replace />;
  }

  if (loadingMisDatos || (!errorMisDatos && !idSesion)) {
    return (
      <Spin spinning tip="Abriendo mis datos…">
        <div style={{ minHeight: 160 }} aria-hidden />
      </Spin>
    );
  }

  return (
    <Alert
      type="warning"
      showIcon
      title="No se pudieron abrir sus datos"
      description={errorMisDatos || 'Su usuario no está vinculado a un estudiante.'}
    />
  );
};

export default EstudianteAdmisionRedirect;
