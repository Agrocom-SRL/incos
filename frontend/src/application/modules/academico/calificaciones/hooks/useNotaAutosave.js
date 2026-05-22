/**
 * Auto-guardado de una celda de nota (debounce + caché local hasta API cuaderno).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveNotaCache } from '../utils/cuadernoLocalCache.js';

const DEBOUNCE_MS = 1500;
const GUARDADO_OK_MS = 2000;
const FAKE_LATENCY_MS = 450;

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
      await new Promise((r) => {
        setTimeout(r, FAKE_LATENCY_MS);
      });
      if (reqId !== requestIdRef.current) return;

      try {
        if (cursoId && bimestre) {
          saveNotaCache(cursoId, bimestre, estudianteId, evaluacionId, value);
        }
        lastSavedRef.current = value;
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
    return persist(valorRef.current);
  }, [persist]);

  return { valor, estado, setValor, reintentar, guardarAhora };
};
