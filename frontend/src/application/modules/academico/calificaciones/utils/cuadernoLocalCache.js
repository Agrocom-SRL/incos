/**
 * Caché local del cuaderno (sessionStorage) hasta conectar API Fase 2-bis.
 */

const evalKey = (asignacionId, bimestre) =>
  `incos:cuaderno-eval:${asignacionId}:${bimestre}`;

const notasKey = (asignacionId, bimestre) =>
  `incos:cuaderno-notas:${asignacionId}:${bimestre}`;

export const loadEvaluacionesCache = (asignacionId, bimestre) => {
  try {
    const raw = sessionStorage.getItem(evalKey(asignacionId, bimestre));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveEvaluacionesCache = (asignacionId, bimestre, evaluaciones) => {
  try {
    sessionStorage.setItem(evalKey(asignacionId, bimestre), JSON.stringify(evaluaciones));
  } catch {
    /* ignore quota */
  }
};

export const loadNotasCache = (asignacionId, bimestre) => {
  try {
    const raw = sessionStorage.getItem(notasKey(asignacionId, bimestre));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveNotaCache = (asignacionId, bimestre, estudianteId, evaluacionId, valor) => {
  const all = loadNotasCache(asignacionId, bimestre);
  const cellKey = `${estudianteId}::${evaluacionId}`;
  if (valor == null || valor === '') {
    delete all[cellKey];
  } else {
    all[cellKey] = valor;
  }
  try {
    sessionStorage.setItem(notasKey(asignacionId, bimestre), JSON.stringify(all));
  } catch {
    /* ignore */
  }
};

export const clearNotasEvaluacionCache = (asignacionId, bimestre, evaluacionId) => {
  const all = loadNotasCache(asignacionId, bimestre);
  const prefix = `::${evaluacionId}`;
  for (const key of Object.keys(all)) {
    if (key.endsWith(prefix)) delete all[key];
  }
  try {
    sessionStorage.setItem(notasKey(asignacionId, bimestre), JSON.stringify(all));
  } catch {
    /* ignore */
  }
};

export const aplicarNotasCacheAEstudiantes = (estudiantes, asignacionId, bimestre) => {
  const cache = loadNotasCache(asignacionId, bimestre);
  return estudiantes.map((est) => {
    const notas = { ...(est.notas ?? {}) };
    for (const [cellKey, valor] of Object.entries(cache)) {
      const [estId, evId] = cellKey.split('::');
      if (String(estId) === String(est.id)) {
        notas[evId] = valor;
      }
    }
    return { ...est, notas };
  });
};
