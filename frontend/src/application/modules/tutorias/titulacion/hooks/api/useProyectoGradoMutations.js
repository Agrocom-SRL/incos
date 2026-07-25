/**
 * Hook de API: mutaciones de proyectos de grado (módulo TUT).
 *
 * Crear/actualizar (T7/T8), eliminar soft (T9), asignar tutor (T10, APROBAR —
 * genera el PDF de designación oficial en el backend), transición de estado
 * (T11, APROBAR — emite viabilidad técnica cuando corresponde) e integrantes
 * (T12/T13, EDITAR). Solo HTTP + estado de guardado; el feedback vive en
 * hooks/state (patrón `useCursoCapacitacionMutations`).
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';

export const useProyectoGradoMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarProyecto = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await proyectoGradoRepository.actualizar(id, payload)
        : await proyectoGradoRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminarProyecto = useCallback((id) => proyectoGradoRepository.eliminar(id), []);

  const asignarTutor = useCallback(
    (id, tutorId) => proyectoGradoRepository.asignarTutor(id, { tutorId }),
    [],
  );

  const aprobarEtapa = useCallback(
    (id, payload) => proyectoGradoRepository.aprobarEtapa(id, payload),
    [],
  );

  const agregarIntegrante = useCallback(
    (id, payload) => proyectoGradoRepository.agregarIntegrante(id, payload),
    [],
  );

  const actualizarIntegrante = useCallback(
    (id, integranteId, payload) =>
      proyectoGradoRepository.actualizarIntegrante(id, integranteId, payload),
    [],
  );

  return useMemo(
    () => ({
      saving,
      guardarProyecto,
      eliminarProyecto,
      asignarTutor,
      aprobarEtapa,
      agregarIntegrante,
      actualizarIntegrante,
    }),
    [
      saving,
      guardarProyecto,
      eliminarProyecto,
      asignarTutor,
      aprobarEtapa,
      agregarIntegrante,
      actualizarIntegrante,
    ],
  );
};
