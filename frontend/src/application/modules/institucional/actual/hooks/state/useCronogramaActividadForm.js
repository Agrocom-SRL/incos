/**
 * Estado del formulario (página) de una actividad de calendario: carga periodos +
 * catálogo para los selects, precarga en edición (GET /:id) y persiste (crear/editar).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useCronogramaAdminApi } from '../api/useCronogramaAdminApi.js';
import { actualPaths } from '../../config/paths.js';

const fmt = (d) => (d ? d.format('YYYY-MM-DD') : null);

export function useCronogramaActividadForm(mode = 'create') {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const actividadId = isEdit ? Number(id) : null;
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { saving, fetchData, fetchById, crear, actualizar } = useCronogramaAdminApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [gestion, setGestion] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const opciones = await fetchData();
      if (!activo) return;
      if (opciones.success) {
        setPeriodos(opciones.data?.periodos ?? []);
        setCatalogo(opciones.data?.catalogo ?? []);
        setGestion(opciones.data?.gestion ?? null);
      } else {
        setError(opciones.error || 'No se pudieron cargar las opciones del cronograma.');
      }
      if (isEdit && Number.isFinite(actividadId)) {
        const det = await fetchById(actividadId);
        if (!activo) return;
        if (det.success && det.data) {
          form.setFieldsValue({
            periodoAcademicoId: det.data.periodoAcademicoId,
            actividadId: det.data.actividadId ?? undefined,
            nombrePersonalizado: det.data.nombrePersonalizado ?? '',
            fechaInicio: det.data.fechaInicio ? dayjs(det.data.fechaInicio) : null,
            fechaFin: det.data.fechaFin ? dayjs(det.data.fechaFin) : null,
          });
        } else {
          setError(det.error || 'No se pudo cargar la actividad.');
        }
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, [fetchData, fetchById, isEdit, actividadId, form]);

  const handleVolver = useCallback(() => navigate(actualPaths.cronograma()), [navigate]);

  const handleSubmit = useCallback(async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const nombre = values.nombrePersonalizado?.trim() || null;
    if (!values.actividadId && !nombre) {
      form.setFields([
        {
          name: 'nombrePersonalizado',
          errors: ['Elige una actividad del catálogo o escribe un nombre.'],
        },
      ]);
      return;
    }
    const payload = {
      periodoAcademicoId: values.periodoAcademicoId,
      actividadId: values.actividadId ?? null,
      nombrePersonalizado: nombre,
      fechaInicio: fmt(values.fechaInicio),
      fechaFin: fmt(values.fechaFin),
    };
    const result = isEdit ? await actualizar(actividadId, payload) : await crear(payload);
    if (result.success) {
      notification.success({ title: isEdit ? 'Actividad actualizada' : 'Actividad creada' });
      navigate(actualPaths.cronograma());
    } else {
      notification.error({ title: 'No se pudo guardar', description: result.error });
    }
  }, [form, isEdit, actividadId, actualizar, crear, notification, navigate]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
      { title: 'Gestión actual', href: actualPaths.root() },
      { title: 'Cronograma', href: actualPaths.cronograma() },
      { title: isEdit ? 'Editar actividad' : 'Nueva actividad' },
    ],
    [isEdit],
  );

  return {
    form,
    isEdit,
    loading,
    saving,
    error,
    periodos,
    catalogo,
    gestion,
    permisoAccion: isEdit ? 'EDITAR' : 'CREAR',
    pageTitle: isEdit ? 'Editar actividad' : 'Nueva actividad',
    breadcrumbItems,
    handleVolver,
    handleSubmit,
  };
}
