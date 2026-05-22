/**
 * Registro agregado de estados de auto-guardado por celda (footer del cuaderno).
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
  const [tick, bump] = useReducer((n) => n + 1, 0);

  const registerCell = useCallback((cellKey, snapshot) => {
    cellsRef.current.set(cellKey, {
      ...snapshot,
      cellKey,
    });
    if (snapshot.estado === 'guardado') {
      setLastGuardadoAt(Date.now());
    }
    bump();
  }, []);

  const guardarEvaluacion = useCallback(async (evaluacionId) => {
    const cells = [...cellsRef.current.values()].filter(
      (c) => c.evaluacionId === evaluacionId && c.guardarAhora,
    );
    await Promise.all(cells.map((c) => c.guardarAhora()));
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

  const footerState = useMemo(() => {
    const cells = [...cellsRef.current.values()];
    const conError = cells.filter((c) => c.estado === 'error');

    if (conError.length > 0) {
      return {
        tipo: 'error',
        cantidad: conError.length,
        reintentarTodas: () => {
          conError.forEach((c) => c.reintentar?.());
        },
      };
    }

    if (cells.some((c) => c.estado === 'pendiente' || c.estado === 'guardando')) {
      return { tipo: 'guardando' };
    }

    if (lastGuardadoAt && Date.now() - lastGuardadoAt < GUARDADO_VISIBLE_MS) {
      const haceSeg = Math.max(0, Math.floor((Date.now() - lastGuardadoAt) / 1000));
      return { tipo: 'guardado', haceSeg };
    }

    return { tipo: 'sin-cambios' };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick refresca "hace X seg"
  }, [tick, lastGuardadoAt]);

  const value = useMemo(
    () => ({ registerCell, unregisterCell, footerState, guardarEvaluacion, resetEvaluacionRegistro }),
    [registerCell, unregisterCell, footerState, guardarEvaluacion, resetEvaluacionRegistro],
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
