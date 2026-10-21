/**
 * Registro agregado de cambios locales del cuaderno (persistencia al pulsar Guardar notas).
 * Registry y footer en contextos separados para no re-renderizar celdas cada 5 s.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { CuadernoRegistryContext, CuadernoFooterContext } from './cuadernoAutosaveContexts';

const GUARDADO_VISIBLE_MS = 30_000;

export const CuadernoAutosaveProvider = ({ children }) => {
  const cellsRef = useRef(new Map());
  const [lastGuardadoAt, setLastGuardadoAt] = useState(null);
  const [guardandoBimestre, setGuardandoBimestre] = useState(false);
  const [registryTick, bumpRegistry] = useReducer((n) => n + 1, 0);
  const [footerClockTick, setFooterClockTick] = useState(0);

  const registerCell = useCallback((cellKey, snapshot) => {
    const prev = cellsRef.current.get(cellKey);
    const pendienteAhora = Boolean(snapshot.necesitaGuardar?.());
    const pendienteAntes = Boolean(prev?.necesitaGuardar?.());
    const estadoCambio = prev?.estado !== snapshot.estado;

    cellsRef.current.set(cellKey, {
      ...snapshot,
      cellKey,
    });

    if (!prev || pendienteAhora !== pendienteAntes || estadoCambio) {
      bumpRegistry();
    }
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
    bumpRegistry();
  }, []);

  const resetEvaluacionRegistro = useCallback((evaluacionId) => {
    let huboCambio = false;
    for (const [key, cell] of cellsRef.current.entries()) {
      if (cell.evaluacionId === evaluacionId) {
        cellsRef.current.delete(key);
        huboCambio = true;
      }
    }
    if (huboCambio) bumpRegistry();
  }, []);

  const unregisterCell = useCallback((cellKey) => {
    if (!cellsRef.current.has(cellKey)) return;
    cellsRef.current.delete(cellKey);
    bumpRegistry();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setFooterClockTick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const hayCambiosPendientes = useMemo(() => {
    return [...cellsRef.current.values()].some((c) => c.necesitaGuardar?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- registryTick al editar celdas
  }, [registryTick]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- los ticks fuerzan recalcular el reloj y el registro mutable de celdas
  }, [footerClockTick, registryTick, lastGuardadoAt, guardandoBimestre]);

  const registryValue = useMemo(
    () => ({
      registerCell,
      unregisterCell,
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
      guardandoBimestre,
      collectNotasParaGuardar,
      marcarNotasGuardadasEnLote,
      resetEvaluacionRegistro,
      hayCambiosPendientes,
    ],
  );

  return (
    <CuadernoRegistryContext.Provider value={registryValue}>
      <CuadernoFooterContext.Provider value={footerState}>{children}</CuadernoFooterContext.Provider>
    </CuadernoRegistryContext.Provider>
  );
};
