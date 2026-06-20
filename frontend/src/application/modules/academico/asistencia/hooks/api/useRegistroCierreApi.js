/**
 * Cierre / reapertura del registro de asistencia. Por DÍA si se pasa `fecha` (una sesión),
 * o en lote por bimestre. Mutaciones imperativas: `cerrar(asignacionId, { bimestre, fecha })`.
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useRegistroCierreApi = () => {
  const [procesando, setProcesando] = useState(false);

  const cerrar = useCallback(async (asignacionId, { bimestre, fecha } = {}) => {
    setProcesando(true);
    try {
      const uc = useCasesFactory.cerrarRegistroAsistencia();
      return await uc.ejecutar(asignacionId, { bimestre, fecha });
    } finally {
      setProcesando(false);
    }
  }, []);

  const reabrir = useCallback(async (asignacionId, { bimestre, fecha } = {}) => {
    setProcesando(true);
    try {
      const uc = useCasesFactory.reabrirRegistroAsistencia();
      return await uc.ejecutar(asignacionId, { bimestre, fecha });
    } finally {
      setProcesando(false);
    }
  }, []);

  return { cerrar, reabrir, procesando };
};
