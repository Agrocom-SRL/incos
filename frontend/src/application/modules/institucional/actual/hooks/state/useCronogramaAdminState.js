/**
 * Estado de la página de administración del Cronograma: tabla de actividades de la
 * gestión vigente + baja (confirm). El alta/edición vive en una página de formulario
 * (`/institucional/actual/cronograma/nueva` y `/:id/editar`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCronogramaAdminApi } from '../api/useCronogramaAdminApi.js';
import { actualPaths } from '../../config/paths.js';

export function useCronogramaAdminState() {
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { loading, fetchData, eliminar } = useCronogramaAdminApi();

  const [data, setData] = useState({ gestion: null, actividades: [] });
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    const result = await fetchData();
    if (result.success) {
      setData({
        gestion: result.data?.gestion ?? null,
        actividades: result.data?.actividades ?? [],
      });
      setError(null);
    } else {
      setError(result.error || 'No se pudo cargar el cronograma.');
    }
  }, [fetchData]);

  useEffect(() => {
    let activo = true;
    (async () => {
      const result = await fetchData();
      if (!activo) return;
      if (result.success) {
        setData({
          gestion: result.data?.gestion ?? null,
          actividades: result.data?.actividades ?? [],
        });
        setError(null);
      } else {
        setError(result.error || 'No se pudo cargar el cronograma.');
      }
    })();
    return () => {
      activo = false;
    };
  }, [fetchData]);

  const goToNueva = useCallback(() => navigate(actualPaths.cronogramaNueva()), [navigate]);
  const goToEditar = useCallback(
    (record) => navigate(actualPaths.cronogramaEditar(record.id)),
    [navigate],
  );

  const eliminarActividad = useCallback(
    (record) => {
      modal.confirm({
        title: 'Eliminar actividad',
        content: `¿Eliminar "${record.nombre}" del cronograma? Esta acción no se puede deshacer.`,
        okText: 'Eliminar',
        okType: 'danger',
        cancelText: 'Cancelar',
        onOk: async () => {
          const result = await eliminar(record.id);
          if (result.success) {
            notification.success({ title: 'Actividad eliminada' });
            await cargar();
          } else {
            notification.error({ title: 'No se pudo eliminar', description: result.error });
          }
        },
      });
    },
    [modal, eliminar, notification, cargar],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual', href: actualPaths.root() },
      { title: 'Cronograma' },
    ],
    [],
  );

  return {
    loading,
    error,
    gestion: data.gestion,
    actividades: data.actividades,
    goToNueva,
    goToEditar,
    eliminarActividad,
    breadcrumbItems,
    pageTitle: 'Cronograma de la gestión',
    goToPanel: useCallback(() => navigate(actualPaths.root()), [navigate]),
  };
}
