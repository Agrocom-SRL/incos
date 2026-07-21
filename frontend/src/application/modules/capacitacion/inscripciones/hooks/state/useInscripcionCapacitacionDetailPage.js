/**
 * Hook de pantalla: ficha de una inscripción de capacitación (CAP · DETALLE).
 *
 * Espejo de `usePagosDetailPage`: breadcrumbs, volver y navegación al flujo
 * "Registrar pago" (página propia, permiso capacitacion.pago CREAR — validado
 * en el `ActionButton` de la ficha).
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapRegistrarPagoPath,
} from '@application-capacitacion/config/paths';

export const useInscripcionCapacitacionDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { inscripcionId, inscripcion, loading, error } = useInscripcionCapacitacionDetailContext();

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

  return {
    inscripcion,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleIrARegistrarPago,
  };
};
