/**
 * Autoguardado de observaciones del centralizador por bimestre.
 * Persiste en bimestres_matricula.observaciones al salir del campo (blur).
 */

import { useCallback, useRef } from 'react';
import { usePermiso } from '@application-auth';
import { useCasesFactory } from '@container';
import { CENTRALIZADOR_PERMISOS } from '../utils/centralizadorPermisos.js';

const DEBOUNCE_MS = 600;

/**
 * @param {Object} params
 * @param {number|null} params.paraleloGestionId
 * @param {number|null} params.bimestre
 * @param {(estudianteId: number, observacion: string|null) => void} [params.onGuardado]
 */
export const useCentralizadorObservacionesBimestre = ({
  paraleloGestionId,
  bimestre,
  onGuardado,
} = {}) => {
  const puedeEditar = usePermiso(CENTRALIZADOR_PERMISOS.centralizador, 'EDITAR');
  const timersRef = useRef(new Map());
  const ultimoGuardadoRef = useRef(new Map());

  const guardar = useCallback(
    async (estudianteId, observacion) => {
      if (!puedeEditar || paraleloGestionId == null || bimestre == null || estudianteId == null) {
        return { success: false, error: 'Sin permiso o contexto incompleto' };
      }

      const texto = observacion == null ? null : String(observacion).trim() || null;
      const clave = `${estudianteId}`;
      const previo = ultimoGuardadoRef.current.get(clave);
      if (previo === texto) {
        return { success: true, skipped: true };
      }

      const uc = useCasesFactory.guardarObservacionCentralizadorBimestre();
      const result = await uc.ejecutar({
        paraleloGestionId,
        bimestre,
        estudianteId,
        observacion: texto,
      });

      if (result?.success) {
        ultimoGuardadoRef.current.set(clave, texto);
        onGuardado?.(estudianteId, texto);
      }

      return result;
    },
    [puedeEditar, paraleloGestionId, bimestre, onGuardado],
  );

  const programarGuardado = useCallback(
    (estudianteId, observacion) => {
      const clave = `${estudianteId}`;
      const prevTimer = timersRef.current.get(clave);
      if (prevTimer) clearTimeout(prevTimer);

      timersRef.current.set(
        clave,
        setTimeout(() => {
          timersRef.current.delete(clave);
          guardar(estudianteId, observacion);
        }, DEBOUNCE_MS),
      );
    },
    [guardar],
  );

  const registrarValorInicial = useCallback((estudianteId, observacion) => {
    const texto = observacion == null ? null : String(observacion).trim() || null;
    ultimoGuardadoRef.current.set(`${estudianteId}`, texto);
  }, []);

  return {
    puedeEditar,
    guardar,
    programarGuardado,
    registrarValorInicial,
  };
};
