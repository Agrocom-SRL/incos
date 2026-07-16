/**
 * Provider: ficha de una inscripción de capacitación (CAP).
 *
 * Espejo de `PagosDetailProvider`: ensambla la ficha (auto-fetch por id), el
 * registro de pagos y los catálogos de pago COMPARTIDOS de Finanzas
 * (`usePaymentCatalogsApi` — métodos/cuentas, lectura transparente por
 * `sistema.catalogo.referencia`; no se reimplementa el fetch).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetInscripcionCapacitacion } from '@application-capacitacion/inscripciones/hooks/api/useGetInscripcionCapacitacion';
import { useInscripcionCapacitacionMutations } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations';
import { usePaymentCatalogsApi } from '@application-finanzas/hooks/api/usePaymentCatalogsApi';
import { InscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/context/InscripcionCapacitacionDetailContext';

export const InscripcionCapacitacionDetailProvider = ({ children, inscripcionId }) => {
  const { inscripcion, loading, error, cargar } = useGetInscripcionCapacitacion();
  const { registrandoPago, registrarPago } = useInscripcionCapacitacionMutations();
  const {
    metodosPago,
    cuentasPago,
    loading: loadingCatalogos,
    error: errorCatalogos,
  } = usePaymentCatalogsApi();

  const id = Number(inscripcionId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const refetch = useCallback(() => {
    if (idValido) return cargar(id);
    return Promise.resolve({ success: false });
  }, [idValido, id, cargar]);

  const registrarPagoInscripcion = useCallback(
    (payload) => {
      if (!idValido) return Promise.resolve({ success: false, error: 'Inscripción inválida' });
      return registrarPago(id, payload);
    },
    [idValido, id, registrarPago],
  );

  const value = useMemo(
    () => ({
      inscripcionId: idValido ? id : null,
      inscripcion,
      loading,
      error: idValido ? error : 'Identificador de inscripción inválido',
      refetch,
      // Registro de pago
      registrarPago: registrarPagoInscripcion,
      registrandoPago,
      // Catálogos de pago (compartidos con Finanzas)
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
    }),
    [
      idValido,
      id,
      inscripcion,
      loading,
      error,
      refetch,
      registrarPagoInscripcion,
      registrandoPago,
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
    ],
  );

  return (
    <InscripcionCapacitacionDetailContext.Provider value={value}>
      {children}
    </InscripcionCapacitacionDetailContext.Provider>
  );
};
