/**
 * Auto-guardado de una celda de nota (debounce + API cuaderno).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';

const DEBOUNCE_MS = 1500;
const GUARDADO_OK_MS = 2000;

const valoresIguales = (a, b) => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
};

export const useNotaAutosave = ({
  cursoId,
  bimestre,
  estudianteId,
  evaluacionId,
  valorInicial,
  onEstadoChange,
}) => {
  const [valor, setValorState] = useState(valorInicial ?? null);
  const [estado, setEstado] = useState('idle');

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastSavedRef = useRef(valorInicial ?? null);
  const valorRef = useRef(valorInicial ?? null);

  useEffect(() => {
    const inicial = valorInicial ?? null;
    setValorState(inicial);
    valorRef.current = inicial;
    lastSavedRef.current = inicial;
    setEstado('idle');
    requestIdRef.current += 1;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, [valorInicial, estudianteId, evaluacionId, cursoId, bimestre]);

  useEffect(() => {
    onEstadoChange?.(estado);
  }, [estado, onEstadoChange]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const persist = useCallback(
    async (value) => {
      const reqId = ++requestIdRef.current;
      setEstado('guardando');

      if (!cursoId || !bimestre) {
        if (reqId === requestIdRef.current) setEstado('error');
        return;
      }

      try {
        const result = await CalificacionRepository.guardarNotaCuaderno(cursoId, bimestre, {
          estudianteId,
          evaluacionId,
          nota: value,
        });
        if (reqId !== requestIdRef.current) return;

        if (!result.success) {
          setEstado('error');
          return;
        }

        const guardada = result.data?.nota ?? value;
        lastSavedRef.current = guardada ?? null;
        setEstado('guardado');
        setTimeout(() => {
          if (reqId === requestIdRef.current) setEstado('idle');
        }, GUARDADO_OK_MS);
      } catch {
        if (reqId === requestIdRef.current) setEstado('error');
      }
    },
    [cursoId, bimestre, estudianteId, evaluacionId],
  );

  const scheduleSave = useCallback(
    (value) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        if (valoresIguales(value, lastSavedRef.current)) {
          setEstado('idle');
          return;
        }
        persist(value);
      }, DEBOUNCE_MS);
    },
    [persist],
  );

  const setValor = useCallback(
    (nuevoValor) => {
      requestIdRef.current += 1;
      valorRef.current = nuevoValor;
      setValorState(nuevoValor);
      setEstado('pendiente');
      scheduleSave(nuevoValor);
    },
    [scheduleSave],
  );

  const reintentar = useCallback(() => {
    requestIdRef.current += 1;
    persist(valorRef.current);
  }, [persist]);

  const guardarAhora = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    requestIdRef.current += 1;
    if (valoresIguales(valorRef.current, lastSavedRef.current)) {
      setEstado('idle');
      return Promise.resolve();
    }
    return persist(valorRef.current);
  }, [persist]);

  const necesitaGuardar = useCallback(
    () => !valoresIguales(valorRef.current, lastSavedRef.current),
    [],
  );

  const obtenerPayload = useCallback(
    () => ({
      estudianteId,
      evaluacionId,
      nota: valorRef.current,
    }),
    [estudianteId, evaluacionId],
  );

  const marcarGuardado = useCallback((notaPersistida) => {
    const guardada = notaPersistida !== undefined ? notaPersistida : valorRef.current;
    lastSavedRef.current = guardada ?? null;
    setEstado('idle');
  }, []);

  return {
    valor,
    estado,
    setValor,
    reintentar,
    guardarAhora,
    necesitaGuardar,
    obtenerPayload,
    marcarGuardado,
  };
};
