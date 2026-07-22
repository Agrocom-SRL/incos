/**
 * Hook de pantalla: ficha de una inscripción de capacitación (CAP · DETALLE).
 *
 * Espejo de `usePagosDetailPage`: breadcrumbs, volver y navegación al flujo
 * "Registrar pago" (página propia, permiso capacitacion.pago CREAR — validado
 * en el `ActionButton` de la ficha). Además resuelve "Anular inscripción"
 * (capacitacion.inscripcion EDITAR — no existe acción ANULAR en el
 * vocabulario cerrado de permisos): decisión administrativa manual, el monto
 * ya pagado no se devuelve. Solo aplica desde PENDIENTE o INSCRITO — no se
 * ofrece si la inscripción ya está RETIRADA o ANULADA.
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import { ESTADOS_INSCRIPCION_CAP_VIGENTES } from '@application-capacitacion/utils/capacitacionPills';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapRegistrarPagoPath,
} from '@application-capacitacion/config/paths';

export const useInscripcionCapacitacionDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const {
    inscripcionId,
    inscripcion,
    loading,
    error,
    anularInscripcion,
    anulando,
  } = useInscripcionCapacitacionDetailContext();

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Detalle de inscripción' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleIrARegistrarPago = useCallback(() => {
    if (!inscripcionId) return;
    navigate(inscripcionCapRegistrarPagoPath(inscripcionId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, inscripcionId, returnListPath, menuSidebarKey]);

  /** Solo se ofrece anular desde PENDIENTE o INSCRITO (mismas reglas que el backend). */
  const puedeAnular = ESTADOS_INSCRIPCION_CAP_VIGENTES.includes(inscripcion?.estado);

  const handleAnular = useCallback(async () => {
    const result = await anularInscripcion();
    if (!result?.success) {
      message.error(result?.error || 'No se pudo anular la inscripción');
      return;
    }
    message.success('La inscripción quedó anulada.');
  }, [anularInscripcion, message]);

  return {
    inscripcion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleIrARegistrarPago,
    puedeAnular,
    handleAnular,
    anulando,
  };
};
