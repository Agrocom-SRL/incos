/**
 * Catálogo de tipos de evaluación (cache a nivel de módulo).
 */

import { useEffect, useState } from 'react';
import { calificacionesFakeApi } from '../fake-api/index.js';

let tiposCache = null;
let tiposPromise = null;

const loadTipos = async () => {
  if (tiposCache) return tiposCache;
  if (!tiposPromise) {
    tiposPromise = calificacionesFakeApi
      .obtenerTiposEvaluacion({ ambito: 'BIMESTRE' })
      .then((data) => {
        tiposCache = data;
        return data;
      })
      .catch((err) => {
        tiposPromise = null;
        throw err;
      });
  }
  return tiposPromise;
};

export const useTiposEvaluacion = () => {
  const [tipos, setTipos] = useState(tiposCache);
  const [isLoading, setIsLoading] = useState(!tiposCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (tiposCache) {
        setTipos(tiposCache);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadTipos();
        if (!cancelled) {
          setTipos(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setTipos(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tipos: tipos ?? [], isLoading, error };
};
