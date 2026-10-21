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
 *
 * Checklist de requisitos: se edita sobre un borrador local (`requisitosDraft`)
 * y se guarda con `PUT …/requisitos` (el backend recalcula el estado). También
 * resuelve qué falta para pasar a INSCRITO (`pendientes`) y el
 * adjuntar/descargar comprobante de un pago (opcional).
 */

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import dayjs from 'dayjs';
import { ESTADOS_INSCRIPCION_CAP_VIGENTES } from '@application-capacitacion/utils/capacitacionPills';
import { calcularPendientesInscripcion } from '@application-capacitacion/utils/inscripcionPendientes';
import {
  alternarEntregado,
  hayCambiosRequisitos,
} from '@application-capacitacion/utils/requisitosCapacitacion';
import { mapRequisitosToPayload } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
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
    guardarRequisitos,
    guardandoRequisitos,
    adjuntarComprobantePago,
    subiendoComprobante,
    descargarComprobantePago,
  } = useInscripcionCapacitacionDetailContext();

  // Borrador del checklist: `null` = sin cambios (se muestra lo persistido); al
  // marcar/desmarcar pasa a ser una copia editable hasta guardar o descartar.
  const [requisitosEditados, setRequisitosEditados] = useState(null);
  const requisitosDraft = useMemo(
    () => requisitosEditados ?? inscripcion?.requisitos ?? [],
    [requisitosEditados, inscripcion?.requisitos],
  );

  const requisitosDirty = useMemo(
    () => hayCambiosRequisitos(inscripcion?.requisitos, requisitosEditados ?? []),
    [inscripcion?.requisitos, requisitosEditados],
  );

  /** Qué falta para INSCRITO (con el estado persistido, no con el borrador). */
  const pendientes = useMemo(() => calcularPendientesInscripcion(inscripcion), [inscripcion]);

  const handleToggleRequisito = useCallback((requisitoId, entregado) => {
    setRequisitosEditados((prev) =>
      alternarEntregado(
        prev ?? inscripcion?.requisitos ?? [],
        requisitoId,
        entregado,
        dayjs().format('YYYY-MM-DD'),
      ),
    );
  }, [inscripcion?.requisitos]);

  const handleGuardarRequisitos = useCallback(async () => {
    const result = await guardarRequisitos(mapRequisitosToPayload(requisitosDraft));
    if (!result?.success) {
      message.error(result?.error || 'No se pudieron guardar los requisitos');
      return;
    }
    setRequisitosEditados(null);
    message.success('Requisitos actualizados');
  }, [guardarRequisitos, requisitosDraft, message]);

  const handleDescartarRequisitos = useCallback(() => {
    setRequisitosEditados(null);
  }, []);

  /** Adjunta/reemplaza el comprobante de un pago (opcional, imagen/PDF). */
  const handleAdjuntarComprobante = useCallback(
    async (pagoId, archivo) => {
      const result = await adjuntarComprobantePago(pagoId, archivo);
      if (!result?.success) {
        message.error(result?.error || 'No se pudo adjuntar el comprobante');
        return false;
      }
      message.success('Comprobante adjuntado');
      return true;
    },
    [adjuntarComprobantePago, message],
  );

  const handleDescargarComprobante = useCallback(
    async (pagoId) => {
      const result = await descargarComprobantePago(pagoId);
      if (!result?.success) message.error(result?.error || 'No se pudo descargar el comprobante');
    },
    [descargarComprobantePago, message],
  );

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
    // Pendientes para INSCRITO
    pendientes,
    // Checklist de requisitos
    requisitosDraft,
    requisitosDirty,
    guardandoRequisitos,
    handleToggleRequisito,
    handleGuardarRequisitos,
    handleDescartarRequisitos,
    // Comprobantes de pago
    subiendoComprobante,
    handleAdjuntarComprobante,
    handleDescargarComprobante,
  };
};
