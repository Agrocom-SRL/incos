/**
 * Hook de pantalla: compromiso de pago de un estudiante (Finanzas).
 *
 * Orquesta el flujo INLINE completo: buscar/seleccionar estudiante → cargar su
 * estado de aporte de la gestión vigente (saldo, estado y CABECERA `pago_aporte`)
 * y su compromiso VIGENTE actual (si existe) → formulario para registrar/actualizar
 * el compromiso → guardar (UPSERT) o eliminar el vigente, con feedback y refetch.
 *
 * Espejo de `usePagosRegistrarPage`: la página es "dumb"; aquí vive toda la lógica.
 *
 * Resolución de la cabecera (`pago_aporte_id`): se obtiene de `estado.cabeceraId`,
 * que el endpoint `estado-registro` devuelve dentro de `cabecera.id`. Si el
 * estudiante aún no tiene cabecera de aporte en la gestión vigente, `cabeceraId`
 * es null y NO hay sobre qué comprometer: se informa al usuario.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useCompromisoContext } from '@application-finanzas/hooks/context/useCompromisoContext';
import { PAGOS_LIST_PATH } from '@application-finanzas/config/paths';

const FIN_PAG_MENU_KEY = 'FIN-PAG';
const DURACION_MENSAJE_ERROR = 8;

export const useCompromisoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const {
    estudiantes,
    loadingBusqueda,
    errorBusqueda,
    buscarEstudiantes,
    cargarEstudiantesPreliminar,
    estado,
    loadingEstado,
    errorEstado,
    cargarEstado,
    limpiarEstado,
    compromiso,
    loadingCompromiso,
    errorCompromiso,
    cargarCompromiso,
    limpiarCompromiso,
    guardarCompromiso,
    guardando,
    eliminarCompromiso,
    eliminando,
  } = useCompromisoContext();

  /** Estudiante seleccionado (DTO de búsqueda) o null mientras se elige. */
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  const returnListPath = location.state?.returnListPath || PAGOS_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? FIN_PAG_MENU_KEY;

  /** Cabecera de aporte (pago_aporte_id) resuelta desde el estado del aporte. */
  const cabeceraId = estado?.cabeceraId ?? null;

  // Carga preliminar de estudiantes con saldo pendiente al montar (mejor UX que lista vacía).
  useEffect(() => {
    cargarEstudiantesPreliminar();
  }, [cargarEstudiantesPreliminar]);

  // Cuando el estado del aporte resuelve una cabecera, carga su compromiso vigente.
  useEffect(() => {
    if (cabeceraId) {
      cargarCompromiso(cabeceraId);
    } else {
      limpiarCompromiso();
    }
  }, [cabeceraId, cargarCompromiso, limpiarCompromiso]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas' },
      { title: 'Pagos', href: returnListPath },
      { title: 'Compromiso de pago' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  /** Selecciona un estudiante y carga su estado de aporte (gestión vigente). */
  const handleSeleccionarEstudiante = useCallback(
    (estudiante) => {
      if (!estudiante?.id) return;
      setEstudianteSeleccionado(estudiante);
      limpiarCompromiso();
      cargarEstado(estudiante.id);
    },
    [cargarEstado, limpiarCompromiso],
  );

  /** Vuelve al paso de selección (limpia estado/compromiso). */
  const handleCambiarEstudiante = useCallback(() => {
    setEstudianteSeleccionado(null);
    limpiarEstado();
    limpiarCompromiso();
  }, [limpiarEstado, limpiarCompromiso]);

  /**
   * Submit: registra o actualiza el compromiso de la cabecera.
   * - Si ya existe compromiso vigente → PUT directo sobre su id.
   * - Si no existe → POST sobre la cabecera (el backend hace el UPSERT).
   */
  const handleGuardar = useCallback(
    async (values) => {
      if (!cabeceraId) {
        message.error('El estudiante no tiene un aporte sobre el cual comprometer un pago');
        return;
      }

      const result = await guardarCompromiso({
        pagoAporteId: cabeceraId,
        compromisoId: compromiso?.id ?? null,
        values,
      });

      if (result?.success) {
        message.success(
          compromiso?.id ? 'Compromiso de pago actualizado' : 'Compromiso de pago registrado',
        );
        await cargarCompromiso(cabeceraId);
      } else {
        message.error(result?.error || 'No se pudo guardar el compromiso', DURACION_MENSAJE_ERROR);
      }
    },
    [cabeceraId, compromiso, guardarCompromiso, cargarCompromiso, message],
  );

  /** Elimina (soft delete) el compromiso vigente y refresca. */
  const handleEliminar = useCallback(async () => {
    if (!compromiso?.id) {
      message.error('No hay un compromiso vigente para eliminar');
      return;
    }

    const result = await eliminarCompromiso(compromiso.id);

    if (result?.success) {
      message.success('Compromiso de pago eliminado');
      if (cabeceraId) {
        await cargarCompromiso(cabeceraId);
      } else {
        limpiarCompromiso();
      }
    } else {
      message.error(result?.error || 'No se pudo eliminar el compromiso', DURACION_MENSAJE_ERROR);
    }
  }, [compromiso, eliminarCompromiso, cabeceraId, cargarCompromiso, limpiarCompromiso, message]);

  return {
    // Layout
    breadcrumbItems,
    returnListPath,
    handleVolver,
    // Búsqueda / selección
    estudiantes,
    loadingBusqueda,
    errorBusqueda,
    buscarEstudiantes,
    estudianteSeleccionado,
    handleSeleccionarEstudiante,
    handleCambiarEstudiante,
    // Estado del aporte
    estado,
    loadingEstado,
    errorEstado,
    cabeceraId,
    // Compromiso
    compromiso,
    loadingCompromiso,
    errorCompromiso,
    // Mutaciones
    handleGuardar,
    guardando,
    handleEliminar,
    eliminando,
  };
};
