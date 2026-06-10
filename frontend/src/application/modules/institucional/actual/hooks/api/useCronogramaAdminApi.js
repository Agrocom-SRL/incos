/**
 * API de la pantalla de administración del Cronograma (CRUD de actividades del
 * calendario académico). Endpoints bajo /v1/calificaciones/cronograma*.
 */

import { useCallback, useState } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';

export const useCronogramaAdminApi = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      return await CalificacionRepository.listarCronogramaAdmin();
    } finally {
      setLoading(false);
    }
  }, []);

  const crear = useCallback(async (payload) => {
    setSaving(true);
    try {
      return await CalificacionRepository.crearActividadCronograma(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const actualizar = useCallback(async (id, payload) => {
    setSaving(true);
    try {
      return await CalificacionRepository.actualizarActividadCronograma(id, payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminar = useCallback((id) => CalificacionRepository.eliminarActividadCronograma(id), []);

  return { loading, saving, fetchData, crear, actualizar, eliminar };
};
