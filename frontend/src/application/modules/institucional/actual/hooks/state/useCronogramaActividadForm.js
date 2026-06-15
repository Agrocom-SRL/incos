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
  const actividadIdEdit = isEdit ? Number(id) : null;
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { saving, fetchData, fetchById, crear, actualizar } = useCronogramaAdminApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [gestion, setGestion] = useState(null);
  // Mapa actividadId(maestra) → [fechaInicio…] ya programadas en la gestión vigente.
  const [actividadesUsadas, setActividadesUsadas] = useState(() => new Map());

  // Estado de UI del formulario: modal de selección, switch de nombre y de un solo día.
  const [modalOpen, setModalOpen] = useState(false);
  const [sobrescribirNombre, setSobrescribirNombre] = useState(false);
  const [eventoUnDia, setEventoUnDia] = useState(true);

  const actividadId = Form.useWatch('actividadId', form);

  useEffect(() => {
    let activo = true;
    (async () => {
      const opciones = await fetchData();
      if (!activo) return;
      if (opciones.success) {
        setPeriodos(opciones.data?.periodos ?? []);
        setCatalogo(opciones.data?.catalogo ?? []);
        setGestion(opciones.data?.gestion ?? null);
        // Actividades maestras ya programadas en la gestión (para avisar reutilización).
        const usos = new Map();
        (opciones.data?.actividades ?? []).forEach((a) => {
          if (a.actividadId == null) return;
          if (isEdit && Number(a.id) === actividadIdEdit) return; // no contar la propia
          const key = Number(a.actividadId);
          const arr = usos.get(key) ?? [];
          arr.push(a.fechaInicio);
          usos.set(key, arr);
        });
        setActividadesUsadas(usos);
      } else {
        setError(opciones.error || 'No se pudieron cargar las opciones del cronograma.');
      }
      if (isEdit && Number.isFinite(actividadIdEdit)) {
        const det = await fetchById(actividadIdEdit);
        if (!activo) return;
        if (det.success && det.data) {
          form.setFieldsValue({
            periodoAcademicoId: det.data.periodoAcademicoId,
            actividadId: det.data.actividadId ?? undefined,
            nombrePersonalizado: det.data.nombrePersonalizado ?? '',
            fechaInicio: det.data.fechaInicio ? dayjs(det.data.fechaInicio) : null,
            fechaFin: det.data.fechaFin ? dayjs(det.data.fechaFin) : null,
          });
          setSobrescribirNombre(Boolean(det.data.nombrePersonalizado));
          setEventoUnDia(!det.data.fechaFin);
        } else {
          setError(det.error || 'No se pudo cargar la actividad.');
        }
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, [fetchData, fetchById, isEdit, actividadIdEdit, form]);

  // Actividad maestra seleccionada (para mostrar nombre + icono en el campo de búsqueda).
  const selectedActividad = useMemo(
    () => catalogo.find((a) => Number(a.id) === Number(actividadId)) ?? null,
    [catalogo, actividadId],
  );

  const openSelector = useCallback(() => setModalOpen(true), []);
  const closeSelector = useCallback(() => setModalOpen(false), []);

  const handleSelectActividad = useCallback(
    (item) => {
      form.setFieldsValue({ actividadId: item?.id ?? undefined });
      setModalOpen(false);
    },
    [form],
  );

  const handleClearActividad = useCallback(() => {
    form.setFieldsValue({ actividadId: undefined });
  }, [form]);

  const toggleSobrescribir = useCallback(
    (checked) => {
      setSobrescribirNombre(checked);
      if (checked) {
        // Sugerencia: precargar el nombre de la actividad para editarlo encima.
        const actual = form.getFieldValue('nombrePersonalizado');
        if (!actual && selectedActividad?.nombre) {
          form.setFieldsValue({ nombrePersonalizado: selectedActividad.nombre });
        }
      } else {
        form.setFieldsValue({ nombrePersonalizado: '' });
      }
    },
    [form, selectedActividad],
  );

  const toggleEventoUnDia = useCallback(
    (checked) => {
      setEventoUnDia(checked);
      if (checked) form.setFieldsValue({ fechaFin: null });
    },
    [form],
  );

  const handleVolver = useCallback(() => navigate(actualPaths.cronograma()), [navigate]);

  const handleSubmit = useCallback(async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    // La actividad maestra es obligatoria (regla del campo). El nombre solo se
    // envía si el usuario activó "personalizar"; si no, se usa el del catálogo.
    const nombre = sobrescribirNombre ? values.nombrePersonalizado?.trim() || null : null;
    const payload = {
      periodoAcademicoId: values.periodoAcademicoId,
      actividadId: values.actividadId ?? null,
      nombrePersonalizado: nombre,
      fechaInicio: fmt(values.fechaInicio),
      fechaFin: eventoUnDia ? null : fmt(values.fechaFin),
    };
    const result = isEdit ? await actualizar(actividadIdEdit, payload) : await crear(payload);
    if (result.success) {
      notification.success({ title: isEdit ? 'Actividad actualizada' : 'Actividad creada' });
      navigate(actualPaths.cronograma());
    } else {
      notification.error({ title: 'No se pudo guardar', description: result.error });
    }
  }, [
    form,
    isEdit,
    actividadIdEdit,
    actualizar,
    crear,
    notification,
    navigate,
    sobrescribirNombre,
    eventoUnDia,
  ]);

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
    // Selector de actividad maestra (modal)
    actividadId,
    selectedActividad,
    actividadesUsadas,
    modalOpen,
    openSelector,
    closeSelector,
    handleSelectActividad,
    handleClearActividad,
    // Switches
    sobrescribirNombre,
    toggleSobrescribir,
    eventoUnDia,
    toggleEventoUnDia,
    permisoAccion: isEdit ? 'EDITAR' : 'CREAR',
    pageTitle: isEdit ? 'Editar actividad' : 'Nueva actividad',
    breadcrumbItems,
    handleVolver,
    handleSubmit,
  };
}
