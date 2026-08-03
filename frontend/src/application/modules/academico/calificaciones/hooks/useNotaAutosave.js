/**
 * Estado local de una celda de nota (sin persistir hasta Guardar notas del bimestre).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const valoresIguales = (a, b) => {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Number(a) === Number(b);
};

export const useNotaAutosave = ({
  estudianteId,
  evaluacionId,
  valorInicial,
  onEstadoChange,
}) => {
  const [valor, setValorState] = useState(valorInicial ?? null);
  const [estado, setEstado] = useState('idle');

  const lastSavedRef = useRef(valorInicial ?? null);
  const valorRef = useRef(valorInicial ?? null);

  // Reinicio al cambiar de celda o de valor persistido: el estado se ajusta
  // durante render (comparación de prev, sin setState en effect)…
  const [prevCelda, setPrevCelda] = useState({ valorInicial, estudianteId, evaluacionId });
  if (
    prevCelda.valorInicial !== valorInicial ||
    prevCelda.estudianteId !== estudianteId ||
    prevCelda.evaluacionId !== evaluacionId
  ) {
    setPrevCelda({ valorInicial, estudianteId, evaluacionId });
    setValorState(valorInicial ?? null);
    setEstado('idle');
  }

  // …y los refs (mutables, prohibidos durante render) se sincronizan tras el commit.
  useEffect(() => {
    const inicial = valorInicial ?? null;
    valorRef.current = inicial;
    lastSavedRef.current = inicial;
  }, [valorInicial, estudianteId, evaluacionId]);

  useEffect(() => {
    onEstadoChange?.(estado);
  }, [estado, onEstadoChange]);

  const setValor = useCallback((nuevoValor) => {
    valorRef.current = nuevoValor;
    setValorState(nuevoValor);
    setEstado(valoresIguales(nuevoValor, lastSavedRef.current) ? 'idle' : 'pendiente');
  }, []);

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
    valorRef.current = guardada ?? null;
    setValorState(guardada ?? null);
    setEstado('idle');
  }, []);

  return {
    valor,
    estado,
    setValor,
    necesitaGuardar,
    obtenerPayload,
    marcarGuardado,
  };
};
