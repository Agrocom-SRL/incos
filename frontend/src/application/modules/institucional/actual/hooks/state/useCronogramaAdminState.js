/**
 * Estado de la página de administración del Cronograma: tabla de actividades de
 * la gestión vigente + alta/edición (modal) + baja (confirm). El formulario vive
 * en el modal (valida y entrega `values` a `submit`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCronogramaAdminApi } from '../api/useCronogramaAdminApi.js';
import { actualPaths } from '../../config/paths.js';

export function useCronogramaAdminState() {
  const navigate = useNavigate();
  const { notification, modal } = App.useApp();
  const { loading, saving, fetchData, crear, actualizar, eliminar } = useCronogramaAdminApi();

  const [data, setData] = useState({ gestion: null, actividades: [], periodos: [], catalogo: [] });
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // actividad en edición, o null = crear

  const cargar = useCallback(async () => {
    const result = await fetchData();
    if (result.success) {
      setData({
        gestion: result.data?.gestion ?? null,
        actividades: result.data?.actividades ?? [],
        periodos: result.data?.periodos ?? [],
        catalogo: result.data?.catalogo ?? [],
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
          periodos: result.data?.periodos ?? [],
          catalogo: result.data?.catalogo ?? [],
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

  const abrirCrear = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const abrirEditar = useCallback((record) => {
    setEditing(record);
    setModalOpen(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const submit = useCallback(
    async (values) => {
      const result = editing
        ? await actualizar(editing.id, values)
        : await crear(values);
      if (result.success) {
        notification.success({ title: editing ? 'Actividad actualizada' : 'Actividad creada' });
        cerrarModal();
        await cargar();
      } else {
        notification.error({ title: 'No se pudo guardar', description: result.error });
      }
      return result.success;
    },
    [editing, actualizar, crear, notification, cerrarModal, cargar],
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
    saving,
    error,
    gestion: data.gestion,
    actividades: data.actividades,
    periodos: data.periodos,
    catalogo: data.catalogo,
    modalOpen,
    editing,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    submit,
    eliminarActividad,
    breadcrumbItems,
    pageTitle: 'Cronograma de la gestión',
    goToPanel: useCallback(() => navigate(actualPaths.root()), [navigate]),
  };
}
