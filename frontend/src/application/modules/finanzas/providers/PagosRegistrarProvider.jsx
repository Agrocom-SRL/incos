/**
 * Provider: registro de abono/pago de aporte (Finanzas).
 *
 * Provider DELGADO (espejo de `PagosDetailProvider`): ensambla los hooks de API
 * — búsqueda de estudiantes, estado del aporte, catálogos de pago y registro —
 * y publica su contrato. La orquestación de pantalla (selección de estudiante,
 * reglas por método, submit, navegación) vive en `usePagosRegistrarPage`
 * (hooks/state), no aquí.
 */

import { useMemo } from 'react';
import { useBuscarEstudiantesRegistro } from '@application-finanzas/hooks/api/useBuscarEstudiantesRegistro';
import { useEstadoAporteRegistro } from '@application-finanzas/hooks/api/useEstadoAporteRegistro';
import { usePaymentCatalogsApi } from '@application-finanzas/hooks/api/usePaymentCatalogsApi';
import { useRegistrarPagoAporte } from '@application-finanzas/hooks/api/useRegistrarPagoAporte';
import { PagosRegistrarContext } from '@application-finanzas/context/PagosRegistrarContext';

export const PagosRegistrarProvider = ({ children }) => {
  const busqueda = useBuscarEstudiantesRegistro();
  const estadoAporte = useEstadoAporteRegistro();
  const catalogos = usePaymentCatalogsApi();
  const registro = useRegistrarPagoAporte();

  const value = useMemo(
    () => ({
      // Búsqueda de estudiantes
      estudiantes: busqueda.estudiantes,
      loadingBusqueda: busqueda.loading,
      errorBusqueda: busqueda.error,
      buscarEstudiantes: busqueda.buscar,
      cargarEstudiantesPreliminar: busqueda.cargarPreliminar,
      limpiarBusqueda: busqueda.limpiar,
      // Estado del aporte
      estado: estadoAporte.estado,
      loadingEstado: estadoAporte.loading,
      errorEstado: estadoAporte.error,
      cargarEstado: estadoAporte.cargarEstado,
      limpiarEstado: estadoAporte.limpiar,
      // Catálogos
      metodosPago: catalogos.metodosPago,
      cuentasPago: catalogos.cuentasPago,
      bancos: catalogos.bancos,
      loadingCatalogos: catalogos.loading,
      errorCatalogos: catalogos.error,
      // Registro
      registrarPago: registro.registrar,
      registrando: registro.loading,
      errorRegistro: registro.error,
    }),
    [busqueda, estadoAporte, catalogos, registro],
  );

  return <PagosRegistrarContext.Provider value={value}>{children}</PagosRegistrarContext.Provider>;
};
