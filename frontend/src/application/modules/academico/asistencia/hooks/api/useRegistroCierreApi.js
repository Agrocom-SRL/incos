/**
 * Cierre / reapertura del registro de asistencia del bimestre (lote de sesiones).
 * Mutaciones imperativas: `cerrar(asignacionId, { bimestre })` / `reabrir(...)`.
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useRegistroCierreApi = () => {
  const [procesando, setProcesando] = useState(false);

  const cerrar = useCallback(async (asignacionId, { bimestre } = {}) => {
    setProcesando(true);
    try {
      const uc = useCasesFactory.cerrarRegistroAsistencia();
      return await uc.ejecutar(asignacionId, { bimestre });
    } finally {
      setProcesando(false);
    }
  }, []);

  const reabrir = useCallback(async (asignacionId, { bimestre } = {}) => {
    setProcesando(true);
    try {
      const uc = useCasesFactory.reabrirRegistroAsistencia();
      return await uc.ejecutar(asignacionId, { bimestre });
    } finally {
      setProcesando(false);
    }
  }, []);

  return { cerrar, reabrir, procesando };
};
