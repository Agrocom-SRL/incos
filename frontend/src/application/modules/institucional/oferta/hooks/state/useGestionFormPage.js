/**
 * Estado de la página de formulario de gestión académica.
 *
 *   mode 'create' — /institucional/oferta/gestiones/nueva
 *     Alta de la gestión destino del flujo de renovación: POST /gestiones y
 *     vuelve a la renovación con la gestión preseleccionada como destino
 *     (location.state.gestionCreadaId).
 *
 *   mode 'edit' — /institucional/oferta/gestiones/:gestionId/editar
 *     Edición de datos base (vigente NO se edita aquí): prefill buscando la
 *     gestión por id en GET /gestiones (no hay GET by id), PUT /gestiones/:id
 *     y vuelve al ORIGEN — location.state.returnListPath, por defecto
 *     Gestiones Pasadas (/institucional/pasadas).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { pasadasPaths } from '@application-institucional/pasadas';
import { ofertaPaths } from '../../config/paths.js';
import { useOfertaAcademicaApi } from '../api/useOfertaAcademicaApi.js';

/** Tipos válidos del ENUM `gestiones.tipo` (backend `TIPOS_GESTION`). */
export const GESTION_TIPO_OPTIONS = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'VERANO', label: 'Verano' },
  { value: 'INVIERNO', label: 'Invierno' },
  { value: 'NIVELACION', label: 'Nivelación' },
  { value: 'EXTRAORDINARIA', label: 'Extraordinaria' },
];

export function useGestionFormPage({ mode = 'create' } = {}) {
  const esEdicion = mode === 'edit';
  const navigate = useNavigate();
  const location = useLocation();
  const { gestionId: gestionIdParam } = useParams();
  const gestionId = Number(gestionIdParam);
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();

  const { crearGestion, actualizarGestion, fetchGestionesSilent } = useOfertaAcademicaApi();
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(esEdicion);
  const [loadError, setLoadError] = useState(null);

  /** Retorno en edición: al lugar de origen (Gestiones Pasadas por defecto). */
  const returnListPath = location.state?.returnListPath ?? pasadasPaths.list();

  /** Alta pensada para la gestión siguiente: año próximo, tipo REGULAR. */
  const initialValues = useMemo(
    () => (esEdicion ? undefined : { anio: new Date().getFullYear() + 1, tipo: 'REGULAR' }),
    [esEdicion]
  );

  // Prefill en edición: la gestión se busca por id en la lista (no hay GET by id).
  useEffect(() => {
    if (!esEdicion) return;
    if (!Number.isFinite(gestionId) || gestionId < 1) {
      setLoadError('Gestión no válida');
      setCargando(false);
      return;
    }
    let cancelado = false;
    (async () => {
      const res = await fetchGestionesSilent();
      if (cancelado) return;
      const raw = res.success ? (res.data?.gestiones ?? res.data?.managements ?? res.data) : [];
      const items = Array.isArray(raw) ? raw : [];
      const gestion = items.find((g) => Number(g.id) === gestionId) ?? null;
      if (!gestion) {
        setLoadError(res.success ? 'No se encontró la gestión a editar' : res.error);
        setCargando(false);
        return;
      }
      form.setFieldsValue({
        codigo: gestion.codigo,
        nombre: gestion.nombre ?? gestion.name,
        anio: gestion.anio,
        tipo: gestion.tipo,
        fechaInicio: gestion.fechaInicio ? dayjs(gestion.fechaInicio) : null,
        fechaFin: gestion.fechaFin ? dayjs(gestion.fechaFin) : null,
      });
      setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [esEdicion, gestionId, fetchGestionesSilent, form]);

  /** POST (create) o PUT (edit); el retorno depende del modo. */
  const onSubmit = useCallback(async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return; // Errores de validación visibles en el propio formulario.
    }

    const payload = {
      codigo: values.codigo?.trim(),
      nombre: values.nombre?.trim(),
      anio: Number(values.anio),
      tipo: values.tipo,
      fecha_inicio: values.fechaInicio?.format('YYYY-MM-DD'),
      fecha_fin: values.fechaFin?.format('YYYY-MM-DD'),
    };

    setGuardando(true);
    try {
      if (esEdicion) {
        const res = await actualizarGestion(gestionId, payload);
        if (!res.success) {
          message.error(res.error || 'No se pudo actualizar la gestión');
          return;
        }
        message.success('Gestión actualizada');
        navigate(returnListPath);
        return;
      }

      const res = await crearGestion(payload);
      if (!res.success) {
        message.error(res.error || 'No se pudo crear la gestión');
        return;
      }
      const nueva = res.data?.gestion ?? null;
      notification.success({
        message: 'Gestión creada',
        description: 'Quedó seleccionada como destino de la renovación de oferta.',
      });
      navigate(ofertaPaths.renovarOferta(), {
        state: nueva?.id != null ? { gestionCreadaId: Number(nueva.id) } : undefined,
      });
    } finally {
      setGuardando(false);
    }
  }, [
    form,
    esEdicion,
    actualizarGestion,
    gestionId,
    crearGestion,
    message,
    notification,
    navigate,
    returnListPath,
  ]);

  const navigateBack = useCallback(
    () => navigate(esEdicion ? returnListPath : ofertaPaths.renovarOferta()),
    [navigate, esEdicion, returnListPath]
  );

  const breadcrumbItems = useMemo(() => {
    const base = [
      { title: 'Inicio', href: '/' },
      { title: 'Institucional', href: '/institucional' },
    ];
    if (esEdicion) {
      return [
        ...base,
        { title: 'Gestiones pasadas', href: pasadasPaths.list() },
        { title: 'Editar gestión' },
      ];
    }
    return [
      ...base,
      { title: 'Oferta Académica', href: ofertaPaths.dashboard() },
      { title: 'Renovación de oferta', href: ofertaPaths.renovarOferta() },
      { title: 'Nueva gestión' },
    ];
  }, [esEdicion]);

  return {
    esEdicion,
    form,
    initialValues,
    tipoOptions: GESTION_TIPO_OPTIONS,
    guardando,
    cargando,
    loadError,
    onSubmit,
    navigateBack,
    // Texto por modo (la página no decide nada)
    pageTitle: esEdicion ? 'Editar gestión académica' : 'Nueva gestión académica',
    submitLabel: esEdicion ? 'Guardar gestión' : 'Crear gestión',
    submitAccion: esEdicion ? 'EDITAR' : 'CREAR',
    cardDesc: esEdicion
      ? 'Datos base de la gestión académica. La condición de vigente no se cambia aquí: se define al renovar la oferta.'
      : 'Gestión académica que recibirá la oferta renovada. Al crearla volverá a la renovación con esta gestión preseleccionada como destino.',
    breadcrumbItems,
  };
}
