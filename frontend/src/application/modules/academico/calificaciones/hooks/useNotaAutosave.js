/**
 * Auto-guardado de una celda de nota (debounce + optimistic UI).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { calificacionesPendingApi as calificacionesFakeApi } from '../api/calificacionesPendingApi.js';

const DEBOUNCE_MS = 1500;
const GUARDADO_IDLE_MS = 2000;

const valoresIguales = (a, b) => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
};

export const useNotaAutosave = ({
  cursoId,
  estudianteId,
  evaluacionId,
  valorInicial,
  onEstadoChange,
}) => {
  const [valor, setValorState] = useState(valorInicial ?? null);
  const [estado, setEstado] = useState('idle');

  const debounceRef = useRef(null);
  const guardadoIdleRef = useRef(null);
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
    if (guardadoIdleRef.current) {
      clearTimeout(guardadoIdleRef.current);
      guardadoIdleRef.current = null;
    }
  }, [valorInicial, estudianteId, evaluacionId, cursoId]);

  useEffect(() => {
    onEstadoChange?.(estado);
  }, [estado, onEstadoChange]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (guardadoIdleRef.current) clearTimeout(guardadoIdleRef.current);
    },
    [],
  );

  const persist = useCallback(
    async (valueToSave) => {
      const reqId = ++requestIdRef.current;
      setEstado('guardando');

      try {
        await calificacionesFakeApi.actualizarNota({
          cursoId,
          estudianteId,
          evaluacionId,
          valor: valueToSave,
        });

        if (reqId !== requestIdRef.current) return;

        lastSavedRef.current = valueToSave;
        setEstado('guardado');

        if (guardadoIdleRef.current) clearTimeout(guardadoIdleRef.current);
        guardadoIdleRef.current = setTimeout(() => {
          if (reqId === requestIdRef.current) {
            setEstado('idle');
          }
        }, GUARDADO_IDLE_MS);
      } catch {
        if (reqId !== requestIdRef.current) return;
        setEstado('error');
      }
    },
    [cursoId, estudianteId, evaluacionId],
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

      if (guardadoIdleRef.current) {
        clearTimeout(guardadoIdleRef.current);
        guardadoIdleRef.current = null;
      }

      scheduleSave(nuevoValor);
    },
    [scheduleSave],
  );

  const reintentar = useCallback(() => {
    requestIdRef.current += 1;
    persist(valorRef.current);
  }, [persist]);

  return { valor, estado, setValor, reintentar };
};
