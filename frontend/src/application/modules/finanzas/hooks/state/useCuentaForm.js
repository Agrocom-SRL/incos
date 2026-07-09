/**
 * Hook de pantalla: ABM (crear/editar) de una CUENTA de pago (Config. de
 * pagos · Finanzas). Gemelo de `useBancoForm.js`/`useBecaDescuentoForm.js`.
 *
 * Consume `ConfigPagosContext` directamente (no crea provider propio). Modo
 * edición: resuelve la cuenta por `id` desde el catálogo ya cargado
 * (`cuentas`), sin GET /:id (mismo criterio que `useCuentaDetailPage`).
 *
 * `numeroCelular` y `qr` son OPCIONALES y están gobernados por sus propios
 * switches (`tieneNumeroCelular`/`tieneQr`, mismo patrón que `tieneFechaFin`
 * de `useAportePage.js`): el campo real solo aparece en `formSections` cuando
 * el switch está en `true`. `qr` es data-driven (`type: 'imageUpload'`, con
 * `previewField`/`buildPreviewUrl` propios — `qrImagenUrl` del backend ya es
 * una URL completa, a diferencia de `imagenRuta` de Carrera).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import {
  mapCuentaToFormValues,
  mapFormValuesToCuentaPayload,
} from '@application-finanzas/mappers/cuentaFormMapper';
import { CONFIGURACION_PATH, cuentaDetallePath } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_CUENTAS='cuentas'). */
const CUENTAS_TAB_PATH = `${CONFIGURACION_PATH}?tab=cuentas`;

/** Construye las secciones del formulario; `activo` solo en modo edición. */
const createCuentaFormSections = ({ metodos, bancos, isEditMode, tieneNumeroCelular, tieneQr }) => {
  const datosFields = [
    {
      name: 'nombreTitular',
      label: 'Nombre del titular',
      type: 'input',
      required: true,
      span: 12,
      placeholder: 'Titular de la cuenta',
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
    {
      name: 'bancoId',
      label: 'Banco (opcional)',
      type: 'select',
      span: 12,
      options: bancos.map((banco) => ({ value: banco.id, label: banco.nombre })),
      placeholder: 'Banco de la cuenta',
    },
    {
      name: 'numeroCuenta',
      label: 'N.° de cuenta (opcional)',
      type: 'input',
      span: 12,
      placeholder: 'Número de cuenta',
      maxLength: 50,
    },
    {
      name: 'tieneNumeroCelular',
      label: '¿Desea agregar número de celular?',
      type: 'switch',
      span: 12,
      checkedChildren: 'Sí',
      unCheckedChildren: 'No',
    },
    ...(tieneNumeroCelular
      ? [
          {
            name: 'numeroCelular',
            label: 'N.° de celular',
            type: 'input',
            required: true,
            span: 12,
            placeholder: 'Número de celular',
            maxLength: 20,
          },
        ]
      : []),
  ];

  // `activo` solo en modo edición: se asigna al crear, se gestiona después (ficha).
  if (isEditMode) {
    datosFields.push({ name: 'activo', label: 'Estado activo', type: 'switch', span: 12 });
  }

  const qrFields = [
    // Registra `qrImagenUrl` como campo real (oculto) para que `Form.useWatch`
    // lo observe de forma confiable — mismo patrón que `imagenRuta` en Carrera.
    { name: 'qrImagenUrl', type: 'hidden', preserve: true },
    {
      name: 'tieneQr',
      label: '¿Desea agregar un QR de cobro?',
      type: 'switch',
      span: 12,
      checkedChildren: 'Sí',
      unCheckedChildren: 'No',
    },
    ...(tieneQr
      ? [
          {
            name: 'qr',
            label: 'Imagen QR',
            type: 'imageUpload',
            span: 12,
            previewField: 'qrImagenUrl',
            buildPreviewUrl: (url) => url || null,
            previewAlt: 'Vista previa del QR de cobro',
            formatsHint: 'Formatos: JPG, PNG',
            accept: '.jpg,.jpeg,.png',
          },
        ]
      : []),
  ];

  return {
    datosCuenta: {
      title: 'Datos de la cuenta',
      description: 'Titular, método de pago asociado, banco y datos de contacto.',
      fields: datosFields,
    },
    qrCuenta: {
      title: 'QR de cobro',
      description: 'QR con el que los estudiantes realizarán el pago (opcional).',
      fields: qrFields,
    },
  };
};

export const useCuentaForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const cuentaId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const {
    cuentas,
    metodos,
    bancos,
    loading: catalogLoading,
    saving,
    guardarCuenta,
    refetch,
  } = useConfigPagosContext();

  const [error, setError] = useState(null);

  const pageTitle = isEditMode ? 'Editar cuenta de pago' : 'Nueva cuenta de pago';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(cuentaId) || cuentaId < 1);
  const loading = isEditMode && !isInvalidEditId ? catalogLoading : false;

  const tieneNumeroCelular = Form.useWatch('tieneNumeroCelular', form);
  const tieneQr = Form.useWatch('tieneQr', form);

  const cuentaActual = useMemo(
    () => (isEditMode && !isInvalidEditId ? (cuentas.find((c) => c.id === cuentaId) ?? null) : null),
    [isEditMode, isInvalidEditId, cuentas, cuentaId],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: CUENTAS_TAB_PATH },
      { title: pageTitle },
    ],
    [pageTitle],
  );

  useEffect(() => {
    if (!isEditMode) {
      form.setFieldsValue(mapCuentaToFormValues(null));
      return;
    }
    if (isInvalidEditId || catalogLoading) return;
    if (cuentaActual) {
      form.setFieldsValue(mapCuentaToFormValues(cuentaActual));
      setError(null);
    } else {
      setError('No se pudo cargar la cuenta');
    }
  }, [isEditMode, isInvalidEditId, catalogLoading, cuentaActual, form]);

  const handleVolver = useCallback(() => navigate(CUENTAS_TAB_PATH), [navigate]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToCuentaPayload(values, { isEditMode });
      const resultado = await guardarCuenta({ id: isEditMode ? cuentaId : null, payload });
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar la cuenta');
      }
      notification.success({ title: isEditMode ? 'Cuenta actualizada' : 'Cuenta creada' });
      // `ConfigPagosProvider` no tiene actualización optimista: sin este refetch,
      // la ficha destino no encontraría la cuenta recién creada.
      await refetch();
      const raw = resultado.data?.cuentaPago ?? resultado.data;
      const savedId = raw?.id ?? cuentaId;
      if (savedId) {
        navigate(cuentaDetallePath(savedId), { replace: !isEditMode });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar la cuenta';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, isEditMode, cuentaId, guardarCuenta, notification, refetch, navigate, handleVolver]);

  const initialValues = useMemo(() => mapCuentaToFormValues(null), []);
  const formSections = useMemo(
    () => createCuentaFormSections({ metodos, bancos, isEditMode, tieneNumeroCelular, tieneQr }),
    [metodos, bancos, isEditMode, tieneNumeroCelular, tieneQr],
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
    cuentaActual,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};

export default useCuentaForm;
