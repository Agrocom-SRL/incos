/**
 * Provider: compromiso de pago de un estudiante (Finanzas).
 *
 * Provider DELGADO (espejo de `PagosRegistrarProvider`): ensambla los hooks de API
 * — búsqueda de estudiantes, estado del aporte (para resolver la cabecera/saldo),
 * compromiso vigente y sus mutaciones (guardar/eliminar) — y publica su contrato.
 * La orquestación de pantalla (selección → carga aporte+compromiso → submit/editar/
 * eliminar) vive en `useCompromisoPage` (hooks/state), no aquí.
 */

import { useMemo } from 'react';
import { useBuscarEstudiantesRegistro } from '@application-finanzas/hooks/api/useBuscarEstudiantesRegistro';
import { useEstadoAporteRegistro } from '@application-finanzas/hooks/api/useEstadoAporteRegistro';
import { useCompromisoPago } from '@application-finanzas/hooks/api/useCompromisoPago';
import { useGuardarCompromiso } from '@application-finanzas/hooks/api/useGuardarCompromiso';
import { useEliminarCompromiso } from '@application-finanzas/hooks/api/useEliminarCompromiso';
import { CompromisoContext } from '@application-finanzas/context/CompromisoContext';

export const CompromisoProvider = ({ children }) => {
  const busqueda = useBuscarEstudiantesRegistro();
  const estadoAporte = useEstadoAporteRegistro();
  const compromisoApi = useCompromisoPago();
  const guardado = useGuardarCompromiso();
  const eliminacion = useEliminarCompromiso();

  const value = useMemo(
    () => ({
      // Búsqueda de estudiantes
      estudiantes: busqueda.estudiantes,
      loadingBusqueda: busqueda.loading,
      errorBusqueda: busqueda.error,
      buscarEstudiantes: busqueda.buscar,
      cargarEstudiantesPreliminar: busqueda.cargarPreliminar,
      limpiarBusqueda: busqueda.limpiar,
      // Estado del aporte (resuelve cabecera y saldo)
      estado: estadoAporte.estado,
      loadingEstado: estadoAporte.loading,
      errorEstado: estadoAporte.error,
      cargarEstado: estadoAporte.cargarEstado,
      limpiarEstado: estadoAporte.limpiar,
      // Compromiso vigente
      compromiso: compromisoApi.compromiso,
      loadingCompromiso: compromisoApi.loading,
      errorCompromiso: compromisoApi.error,
      cargarCompromiso: compromisoApi.cargarCompromiso,
      limpiarCompromiso: compromisoApi.limpiar,
      // Mutaciones
      guardarCompromiso: guardado.guardar,
      guardando: guardado.loading,
      errorGuardar: guardado.error,
      eliminarCompromiso: eliminacion.eliminar,
      eliminando: eliminacion.loading,
      errorEliminar: eliminacion.error,
    }),
    [busqueda, estadoAporte, compromisoApi, guardado, eliminacion],
  );

  return <CompromisoContext.Provider value={value}>{children}</CompromisoContext.Provider>;
};
