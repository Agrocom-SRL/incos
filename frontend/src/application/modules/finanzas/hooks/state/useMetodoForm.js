/**
 * Hook de pantalla: edición de un MÉTODO de pago (Config. de pagos ·
 * Finanzas). Catálogo fijo (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): solo modo
 * edición, único campo editable es el nombre visible. Gemelo de
 * `useBancoForm.js`, simplificado (sin alta).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import {
  mapMetodoToFormValues,
  mapFormValuesToMetodoPayload,
} from '@application-finanzas/mappers/metodoFormMapper';
import { CONFIGURACION_PATH, metodoDetallePath } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_METODOS='metodos'). */
const METODOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=metodos`;

const createMetodoFormSections = () => ({
  datosMetodo: {
    title: 'Nombre del método',
    description:
      'El código del método es fijo. Editá únicamente el nombre con el que se muestra a los estudiantes al registrar un pago.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre visible',
        type: 'input',
        required: true,
        span: 24,
        placeholder: 'Nombre visible del método',
        maxLength: 100,
      },
    ],
  },
});

export const useMetodoForm = () => {
  const { id } = useParams();
  const metodoId = Number(id);
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { metodos, loading: catalogLoading, saving, actualizarMetodoPago, refetch } =
    useConfigPagosContext();

  const [error, setError] = useState(null);

  const pageTitle = 'Editar método de pago';
  const permisoAccion = 'EDITAR';
  const isInvalidEditId = !Number.isFinite(metodoId) || metodoId < 1;
  const loading = !isInvalidEditId ? catalogLoading : false;

  const metodoActual = useMemo(
    () => (isInvalidEditId ? null : (metodos.find((m) => m.id === metodoId) ?? null)),
    [isInvalidEditId, metodos, metodoId],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: METODOS_TAB_PATH },
      { title: pageTitle },
    ],
    [],
  );

  useEffect(() => {
    if (isInvalidEditId || catalogLoading) return;
    if (metodoActual) {
      form.setFieldsValue(mapMetodoToFormValues(metodoActual));
      setError(null);
    } else {
      setError('No se pudo cargar el método de pago');
    }
  }, [isInvalidEditId, catalogLoading, metodoActual, form]);

  const handleVolver = useCallback(() => navigate(METODOS_TAB_PATH), [navigate]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToMetodoPayload(values);
      const resultado = await actualizarMetodoPago(metodoId, payload);
      if (!resultado?.success) {
        throw new Error(resultado?.error || 'No se pudo guardar el método de pago');
      }
      notification.success({ title: 'Método de pago actualizado' });
      // `ConfigPagosProvider` no tiene actualización optimista: sin este refetch,
      // la ficha destino no reflejaría el nombre recién guardado.
      await refetch();
      navigate(metodoDetallePath(metodoId), { replace: true });
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el método de pago';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    }
  }, [form, metodoId, actualizarMetodoPago, notification, refetch, navigate]);

  const initialValues = useMemo(() => mapMetodoToFormValues(null), []);
  const formSections = useMemo(() => createMetodoFormSections(), []);

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
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

export default useMetodoForm;
