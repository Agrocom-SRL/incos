/**
 * Hook de pantalla: ABM (crear/editar) de un BANCO autorizado (Config. de
 * pagos · Finanzas). Gemelo de `useBecaDescuentoForm.js`.
 *
 * Consume `ConfigPagosContext` directamente (el mismo provider que ya usan
 * las fichas de detalle) — no crea un provider propio. Modo edición: resuelve
 * el banco por `id` desde el catálogo ya cargado (`bancos`), sin GET /:id
 * (mismo criterio que `useBancoDetailPage`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import {
  mapBancoToFormValues,
  mapFormValuesToBancoPayload,
} from '@application-finanzas/mappers/bancoFormMapper';
import { CONFIGURACION_PATH, bancoDetallePath } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_BANCOS='bancos'). */
const BANCOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=bancos`;

/** Construye las secciones del formulario; `activo` solo en modo edición. */
const createBancoFormSections = ({ metodos, isEditMode }) => {
  const fields = [
    {
      name: 'codigo',
      label: 'Código',
      type: 'input',
      required: true,
      span: 12,
      placeholder: 'Código del banco',
      maxLength: 50,
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'input',
      required: true,
      span: 12,
      placeholder: 'Nombre del banco',
      maxLength: 150,
    },
    {
      name: 'metodoPagoId',
      label: 'Método de pago (opcional)',
      type: 'select',
      span: 12,
      options: metodos.map((metodo) => ({ value: metodo.id, label: metodo.nombre })),
      placeholder: 'Asociar a un método de pago',
    },
  ];

  // `activo` solo en modo edición: se asigna al crear, se gestiona después (ficha).
  if (isEditMode) {
    fields.push({ name: 'activo', label: 'Estado activo', type: 'switch', span: 12 });
  }

  return {
    datosBanco: {
      title: 'Datos',
      description: 'Identificación del banco y su asociación con un método de pago.',
      fields,
    },
  };
};

export const useBancoForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const bancoId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const {
    bancos,
    metodos,
    loading: catalogLoading,
    saving,
    guardarBanco,
    refetch,
  } = useConfigPagosContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar banco' : 'Nuevo banco';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(bancoId) || bancoId < 1);
  const loading = isEditMode && !isInvalidEditId ? catalogLoading : false;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: BANCOS_TAB_PATH },
      { title: pageTitle },
    ],
    [pageTitle],
  );

  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapBancoToFormValues(null));
      return;
    }
    if (isInvalidEditId || catalogLoading) return;
    const encontrado = bancos.find((b) => b.id === bancoId);
    if (encontrado) {
      form.setFieldsValue(mapBancoToFormValues(encontrado));
      setError(null);
    } else {
      setError('No se pudo cargar el banco');
    }
  }, [isEditMode, isInvalidEditId, catalogLoading, bancos, bancoId, form]);

  const handleVolver = useCallback(() => navigate(BANCOS_TAB_PATH), [navigate]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToBancoPayload(values, { isEditMode });
      const resultado = await guardarBanco({ id: isEditMode ? bancoId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el banco');
      }
      notification.success({ title: isEditMode ? 'Banco actualizado' : 'Banco creado' });
      // `ConfigPagosProvider` no tiene actualización optimista: sin este refetch,
      // la ficha destino no encontraría el banco recién creado.
      await refetch();
      const raw = resultado.data?.bancoAutorizado ?? resultado.data;
      const savedId = raw?.id ?? bancoId;
      if (savedId) {
        navigate(bancoDetallePath(savedId), { replace: !isEditMode });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el banco';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, isEditMode, bancoId, guardarBanco, notification, refetch, navigate, handleVolver]);

  const initialValues = useMemo(() => mapBancoToFormValues(null), []);
  const formSections = useMemo(
    () => createBancoFormSections({ metodos, isEditMode }),
    [metodos, isEditMode],
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

export default useBancoForm;
