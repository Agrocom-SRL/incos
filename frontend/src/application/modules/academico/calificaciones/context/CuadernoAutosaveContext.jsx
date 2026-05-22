/**
 * Registro agregado de cambios locales del cuaderno (persistencia al pulsar Guardar notas).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

const CuadernoAutosaveContext = createContext(null);

const GUARDADO_VISIBLE_MS = 30_000;

export const CuadernoAutosaveProvider = ({ children }) => {
  const cellsRef = useRef(new Map());
  const [lastGuardadoAt, setLastGuardadoAt] = useState(null);
  const [guardandoBimestre, setGuardandoBimestre] = useState(false);
  const [tick, bump] = useReducer((n) => n + 1, 0);

  const registerCell = useCallback((cellKey, snapshot) => {
    cellsRef.current.set(cellKey, {
      ...snapshot,
      cellKey,
    });
    bump();
  }, []);

  const collectNotasParaGuardar = useCallback(() => {
    return [...cellsRef.current.values()]
      .filter((c) => typeof c.obtenerPayload === 'function' && c.necesitaGuardar?.())
      .map((c) => c.obtenerPayload());
  }, []);

  const marcarNotasGuardadasEnLote = useCallback((notasRespuesta = []) => {
    const mapa = new Map(
      (notasRespuesta ?? []).map((n) => [
        `${n.estudianteId}::${n.evaluacionId}`,
        n.nota ?? null,
      ]),
    );

    for (const cell of cellsRef.current.values()) {
      const key = `${cell.estudianteId}::${cell.evaluacionId}`;
      if (mapa.has(key)) {
        cell.marcarGuardado?.(mapa.get(key));
      } else if (!cell.necesitaGuardar?.()) {
        cell.marcarGuardado?.();
      }
    }
    setLastGuardadoAt(Date.now());
    bump();
  }, []);

  const resetEvaluacionRegistro = useCallback((evaluacionId) => {
    for (const [key, cell] of cellsRef.current.entries()) {
      if (cell.evaluacionId === evaluacionId) {
        cellsRef.current.delete(key);
      }
    }
    bump();
  }, []);

  const unregisterCell = useCallback((cellKey) => {
    cellsRef.current.delete(cellKey);
    bump();
  }, []);

  useEffect(() => {
    const id = setInterval(() => bump(), 5000);
    return () => clearInterval(id);
  }, []);

  const hayCambiosPendientes = useMemo(() => {
    return [...cellsRef.current.values()].some((c) => c.necesitaGuardar?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick al editar celdas
  }, [tick]);

  const footerState = useMemo(() => {
    if (guardandoBimestre) {
      return { tipo: 'guardando' };
    }

    const pendientes = [...cellsRef.current.values()].filter((c) => c.necesitaGuardar?.());

    if (pendientes.length > 0) {
      return { tipo: 'pendiente', cantidad: pendientes.length };
    }

    if (lastGuardadoAt && Date.now() - lastGuardadoAt < GUARDADO_VISIBLE_MS) {
      const haceSeg = Math.max(0, Math.floor((Date.now() - lastGuardadoAt) / 1000));
      return { tipo: 'guardado', haceSeg };
    }

    return { tipo: 'sin-cambios' };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick refresca "hace X seg"
  }, [tick, lastGuardadoAt, guardandoBimestre]);

  const value = useMemo(
    () => ({
      registerCell,
      unregisterCell,
      footerState,
      guardandoBimestre,
      setGuardandoBimestre,
      collectNotasParaGuardar,
      marcarNotasGuardadasEnLote,
      resetEvaluacionRegistro,
      hayCambiosPendientes,
    }),
    [
      registerCell,
      unregisterCell,
      footerState,
      guardandoBimestre,
      collectNotasParaGuardar,
      marcarNotasGuardadasEnLote,
      resetEvaluacionRegistro,
      hayCambiosPendientes,
    ],
  );

  return (
    <CuadernoAutosaveContext.Provider value={value}>{children}</CuadernoAutosaveContext.Provider>
  );
};

export const useCuadernoAutosaveRegistry = () => {
  const ctx = useContext(CuadernoAutosaveContext);
  if (!ctx) {
    throw new Error('useCuadernoAutosaveRegistry debe usarse dentro de CuadernoAutosaveProvider');
  }
  return ctx;
};

export const useCuadernoFooterState = () => {
  const { footerState } = useCuadernoAutosaveRegistry();
  return footerState;
};
