/**
 * Hook de pantalla: ABM (crear/editar) del catálogo maestro Becas y descuentos.
 * Gemelo de `configuracion/complementarios/hooks/state/useDiscapacidadForm.js`,
 * con reglas de aplicación condicionales (esAutomatica → tipoAutomatica →
 * promedioMinimo) resueltas vía `Form.useWatch` + inclusión condicional de
 * campos en `formSections` (mismo patrón que `useCronogramaActividadForm`).
 *
 * Modo edición: resuelve el registro por `id` desde el catálogo ya cargado en
 * `BecaDescuentoContext` (sin GET /:id — mismo criterio que las fichas de
 * "Config. de pagos"), evitando una segunda estrategia de carga en el mismo
 * feature aunque el repositorio ya soporta `obtenerPorId`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useBecaDescuentoContext } from '@application-finanzas/becas-descuentos/hooks/context/useBecaDescuentoContext';
import {
  mapBecaDescuentoToFormValues,
  mapFormValuesToBecaDescuentoPayload,
} from '@application-finanzas/becas-descuentos/mappers/becaDescuentoFormMapper';
import {
  CONFIGURACION_PATH,
  becaDescuentoDetallePath,
} from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_BECAS_DESCUENTOS). */
const BECAS_TAB_PATH = `${CONFIGURACION_PATH}?tab=becas-descuentos`;

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const TIPO_AUTOMATICA_OPTIONS = [
  { value: 'PROMEDIO_90', label: 'Por promedio (≥ 90)' },
  { value: 'MANUAL', label: 'Manual' },
];

/** Construye las secciones del formulario; las reglas condicionales solo agregan campos. */
const createBecaDescuentoFormSections = ({ esAutomatica, tipoAutomatica, isEditMode }) => {
  const reglasFields = [
    { name: 'requiereDocumentacion', label: 'Requiere documentación', type: 'switch', span: 8 },
    { name: 'requiereAprobacionRector', label: 'Requiere aprobación del Rector', type: 'switch', span: 8 },
    { name: 'esAutomatica', label: 'Asignación automática', type: 'switch', span: 8 },
  ];

  if (esAutomatica) {
    reglasFields.push({
      name: 'tipoAutomatica',
      label: 'Tipo de asignación automática',
      type: 'select',
      required: true,
      span: 12,
      options: TIPO_AUTOMATICA_OPTIONS,
      placeholder: 'Seleccione el tipo',
    });
    if (tipoAutomatica === 'PROMEDIO_90') {
      reglasFields.push({
        name: 'promedioMinimo',
        label: 'Promedio mínimo',
        type: 'number',
        required: true,
        span: 12,
        min: 0,
        max: 100,
        addonAfter: 'pts',
      });
    }
  }

  // `activo` solo en modo edición: se asigna al crear, se gestiona después (ficha).
  if (isEditMode) {
    reglasFields.push({ name: 'activo', label: 'Estado activo', type: 'switch', span: 8 });
  }

  return {
    datosBeca: {
      title: 'Datos',
      description: 'Catálogo maestro de becas y descuentos disponibles para asignar a estudiantes.',
      fields: [
        {
          name: 'nombre',
          label: 'Nombre',
          type: 'input',
          required: true,
          span: 12,
          placeholder: 'Ej. Beca de excelencia académica',
          maxLength: 100,
          rules: [MIN_TEXT],
        },
        {
          name: 'codigo',
          label: 'Código (opcional)',
          type: 'input',
          span: 12,
          placeholder: 'Ej. BECA-EXC',
          maxLength: 20,
        },
        {
          name: 'porcentaje',
          label: 'Porcentaje de descuento',
          type: 'number',
          required: true,
          span: 12,
          min: 0,
          max: 100,
          addonAfter: '%',
        },
        {
          name: 'descripcion',
          label: 'Descripción',
          type: 'textarea',
          span: 24,
          rows: 3,
          placeholder: 'Descripción de la beca o descuento (opcional)',
        },
      ],
    },
    reglasAplicacion: {
      title: 'Reglas de aplicación',
      description:
        'Condiciones para aplicar la beca o descuento: documentación, aprobación del Rector y asignación automática.',
      fields: reglasFields,
    },
  };
};

export const useBecaDescuentoForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const becaId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { crear, actualizar, saving, becasDescuentos, loading: catalogLoading } =
    useBecaDescuentoContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar beca o descuento' : 'Nueva beca o descuento';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(becaId) || becaId < 1);
  const loading = isEditMode && !isInvalidEditId ? catalogLoading : false;

  const esAutomatica = Form.useWatch('esAutomatica', form);
  const tipoAutomatica = Form.useWatch('tipoAutomatica', form);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: BECAS_TAB_PATH },
      { title: pageTitle },
    ],
    [pageTitle],
  );

  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapBecaDescuentoToFormValues(null));
      return;
    }
    if (isInvalidEditId || catalogLoading) return;
    const encontrada = becasDescuentos.find((b) => b.id === becaId);
    if (encontrada) {
      form.setFieldsValue(mapBecaDescuentoToFormValues(encontrada));
      setError(null);
    } else {
      setError('No se pudo cargar la beca o descuento');
    }
  }, [isEditMode, isInvalidEditId, catalogLoading, becasDescuentos, becaId, form]);

  const handleVolver = useCallback(() => navigate(BECAS_TAB_PATH), [navigate]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToBecaDescuentoPayload(values);
      const resultado = isEditMode ? await actualizar(becaId, payload) : await crear(payload);
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar la beca o descuento');
      }
      notification.success({
        title: isEditMode ? 'Beca o descuento actualizado' : 'Beca o descuento creado',
      });
      const raw = resultado.data?.becaDescuento ?? resultado.data;
      const savedId = raw?.id ?? becaId;
      if (savedId) {
        navigate(becaDescuentoDetallePath(savedId), { replace: !isEditMode });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar la beca o descuento';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, isEditMode, becaId, actualizar, crear, notification, navigate, handleVolver]);

  const initialValues = useMemo(() => mapBecaDescuentoToFormValues(null), []);
  const formSections = useMemo(
    () => createBecaDescuentoFormSections({ esAutomatica, tipoAutomatica, isEditMode }),
    [esAutomatica, tipoAutomatica, isEditMode],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading,
    submitLoading: saving,
    error,
    initialValues,
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};

export default useBecaDescuentoForm;
