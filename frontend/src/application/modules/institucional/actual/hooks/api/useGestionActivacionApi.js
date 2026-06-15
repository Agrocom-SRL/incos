/**
 * API de la pantalla Institucional → Gestión actual.
 *
 * Reutiliza el backend ya existente del módulo de calificaciones (gestión-bimestres):
 * - GET  /v1/calificaciones/gestion-bimestres  → estado de activación
 * - POST /v1/calificaciones/gestion-bimestres/iniciar → activa el cursado masivo
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import GestionRepository from '@infrastructure/repositories/GestionRepository.js';

export const useGestionActivacionApi = () => {
  const [loading, setLoading] = useState(false);
  const [iniciando, setIniciando] = useState(false);

  /** Gestión vigente del instituto. */
  const fetchGestionVigente = useCallback(async () => {
    const result = await GestionRepository.obtenerTodos({ params: { vigente: true } });
    if (!result.success) return { success: false, error: result.error };
    const raw = result.data?.gestiones ?? result.data?.managements ?? result.data;
    const list = Array.isArray(raw) ? raw : [];
    return { success: true, data: list[0] ?? null };
  }, []);

  /** Estado de activación (bimestres) de la gestión vigente. */
  const fetchEstadoActivacion = useCallback(async () => {
    setLoading(true);
    try {
      return await CalificacionRepository.obtenerGestionBimestres();
    } finally {
      setLoading(false);
    }
  }, []);

  /** Cronograma / calendario académico de la gestión vigente. */
  const fetchCronograma = useCallback(
    () => CalificacionRepository.obtenerGestionCronograma(),
    [],
  );

  /** Activa el cursado masivo (INSCRITO → CURSANDO + bimestres). */
  const iniciarGestionAcademica = useCallback(async () => {
    setIniciando(true);
    try {
      return await CalificacionRepository.iniciarGestionAcademica();
    } finally {
      setIniciando(false);
    }
  }, []);

  /** Valida si un bimestre puede cerrarse (cursos con notas faltantes). */
  const validarCierreBimestre = useCallback(
    (numero) => CalificacionRepository.validarCierreBimestre(numero),
    [],
  );

  /** Cierra un bimestre de la gestión (backend en preparación). */
  const cerrarBimestreGestion = useCallback(
    (numero) => CalificacionRepository.cerrarBimestreGestion(numero),
    [],
  );

  return {
    loading,
    iniciando,
    fetchGestionVigente,
    fetchEstadoActivacion,
    fetchCronograma,
    iniciarGestionAcademica,
    validarCierreBimestre,
    cerrarBimestreGestion,
  };
};
