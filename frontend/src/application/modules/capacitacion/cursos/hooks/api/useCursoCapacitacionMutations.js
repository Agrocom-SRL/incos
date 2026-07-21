/**
 * Hook de API: mutaciones de cursos de capacitación (módulo CAP).
 *
 * Crear (POST, acepta horarioIds[]), actualizar (PUT, reemplaza horarioIds[]),
 * cambiar estado activo (PATCH /:id/estado, acción ACTIVAR), transiciones de la
 * máquina de estados (abrir/cancelar, POST, acción EDITAR) y eliminar (DELETE,
 * soft delete). Solo HTTP + estado de guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';

export const useCursoCapacitacionMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarCurso = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await cursoCapacitacionRepository.actualizar(id, payload)
        : await cursoCapacitacionRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const cambiarEstadoCurso = useCallback(
    (id, activo) => cursoCapacitacionRepository.cambiarEstado(id, activo),
    [],
  );

  const eliminarCurso = useCallback((id) => cursoCapacitacionRepository.eliminar(id), []);

  const abrirInscripciones = useCallback(
    (id) => cursoCapacitacionRepository.abrirInscripciones(id),
    [],
  );

  const cancelarCurso = useCallback((id) => cursoCapacitacionRepository.cancelarCurso(id), []);

  return useMemo(
    () => ({
      saving,
      guardarCurso,
      cambiarEstadoCurso,
      eliminarCurso,
      abrirInscripciones,
      cancelarCurso,
    }),
    [saving, guardarCurso, cambiarEstadoCurso, eliminarCurso, abrirInscripciones, cancelarCurso],
  );
};
