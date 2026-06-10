/**
 * Estado de la ficha (detalle) de una actividad de calendario: carga `GET /:id`
 * (permiso DETALLE) y expone navegación a volver/editar.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCronogramaAdminApi } from '../api/useCronogramaAdminApi.js';
import { actualPaths } from '../../config/paths.js';

export function useCronogramaActividadDetail() {
  const { id } = useParams();
  const actividadId = Number(id);
  const navigate = useNavigate();
  const { fetchById } = useCronogramaAdminApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actividad, setActividad] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      setLoading(true);
      if (!Number.isFinite(actividadId)) {
        setError('Identificador de actividad inválido.');
        setLoading(false);
        return;
      }
      const res = await fetchById(actividadId);
      if (!activo) return;
      if (res.success && res.data) {
        setActividad(res.data);
        setError(null);
      } else {
        setError(res.error || 'No se pudo cargar la actividad.');
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, [fetchById, actividadId]);

  const handleVolver = useCallback(() => navigate(actualPaths.cronograma()), [navigate]);
  const goToEditar = useCallback(
    () => navigate(actualPaths.cronogramaEditar(actividadId)),
    [navigate, actividadId],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual', href: actualPaths.root() },
      { title: 'Cronograma', href: actualPaths.cronograma() },
      { title: 'Detalle de actividad' },
    ],
    [],
  );

  return {
    loading,
    error,
    actividad,
    actividadId,
    handleVolver,
    goToEditar,
    breadcrumbItems,
    pageTitle: 'Detalle de actividad',
  };
}
