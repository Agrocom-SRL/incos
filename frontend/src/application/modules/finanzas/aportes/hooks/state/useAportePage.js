/**
 * Hook de pantalla: Aporte de la gestión vigente (Finanzas).
 *
 * Orquesta la página `/finanzas/configuracion/aportes` (sin ítem de menú
 * propio; página hija de "Config. de pagos", permiso `finanzas.aporte` —
 * LISTAR/CREAR/EDITAR, sin ELIMINAR). Consume el contexto del provider,
 * expone breadcrumbs, el formulario data-driven (mismo patrón que
 * `useCarreraForm`/`useMateriaForm`: `formSections` + `CfgFormWorkspace`) y
 * el handler de guardado (UPSERT + feedback + refetch). No hace fetch (eso
 * vive en el provider).
 *
 * Regla de negocio: si `aporteVigente` existe → PUT por id; si no → POST. El
 * backend asocia la gestión vigente cuando no se envía `gestion_id`.
 *
 * `handleVolver`: vuelve a la MISMA pestaña de "Config. de pagos" desde la
 * que se llegó (`ConfigPagosPage` propaga `location.state.returnTab` al
 * navegar aquí); sin ese estado (entrada directa por URL) cae al tab por
 * defecto (métodos).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import { useAporteContext } from '@application-finanzas/aportes/hooks/context/useAporteContext';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Formato de fecha que espera el backend (DATEONLY). */
const toFechaBackend = (value) => (value ? dayjs(value).format('YYYY-MM-DD') : null);

const MONTO_RULES = [
  {
    validator: (_, value) => {
      const monto = Number(value);
      if (!Number.isFinite(monto) || monto <= 0) {
        return Promise.reject(new Error('El monto debe ser mayor a 0'));
      }
      return Promise.resolve();
    },
  },
];

/** Campos del formulario (patrón data-driven de `CfgFormWorkspace`, ver `createCarreraFormSections`). */
const createAporteFormSections = (tieneFechaFin) => ({
  datosAporte: {
    title: 'Aporte de la gestión',
    description:
      'Monto base, vigencia y estado del aporte académico que se cobra a los estudiantes en la gestión vigente.',
    fields: [
      {
        name: 'montoBase',
        label: 'Monto base del aporte',
        type: 'number',
        required: true,
        span: 12,
        min: 0,
        step: 50,
        addonAfter: 'Bs',
        placeholder: '0.00',
        rules: MONTO_RULES,
      },
      {
        name: 'fechaInicio',
        label: 'Fecha de inicio de vigencia',
        type: 'date',
        required: true,
        span: 12,
      },
      {
        name: 'tieneFechaFin',
        label: '¿Tiene fecha de fin de vigencia?',
        type: 'switch',
        span: 12,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      ...(tieneFechaFin
        ? [
            {
              name: 'fechaFin',
              label: 'Fecha de fin de vigencia',
              type: 'date',
              required: true,
              span: 12,
            },
          ]
        : []),
    ],
  },
});

export const useAportePage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { gestionVigente, aporteVigente, loading, error, refetch, saving, guardarConfiguracionAporte } =
    useAporteContext();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('FIN-CFG-APORTES', 'FIN', 'Aportes'),
    [],
  );

  const tieneFechaFin = Form.useWatch('tieneFechaFin', form);
  const formSections = useMemo(() => createAporteFormSections(tieneFechaFin), [tieneFechaFin]);

  // Precarga el formulario con el aporte vigente (o valores por defecto para alta).
  // El estado activo/inactivo NO se precarga como campo editable: se muestra
  // como pill de solo lectura en `AporteFormSections` y se preserva tal cual
  // al guardar (ver `guardarAporte`), para no sobrescribirlo sin querer junto
  // con el resto de la configuración.
  useEffect(() => {
    form.setFieldsValue({
      montoBase: aporteVigente?.montoBase ?? null,
      fechaInicio: aporteVigente?.fechaInicio ? dayjs(aporteVigente.fechaInicio) : null,
      tieneFechaFin: Boolean(aporteVigente?.fechaFin),
      fechaFin: aporteVigente?.fechaFin ? dayjs(aporteVigente.fechaFin) : null,
    });
  }, [aporteVigente, form]);

  const handleVolver = useCallback(() => {
    const returnTab = location.state?.returnTab;
    navigate(returnTab ? `${CONFIGURACION_PATH}?tab=${returnTab}` : CONFIGURACION_PATH);
  }, [navigate, location.state]);

  const guardarAporte = useCallback(
    async (values) => {
      const payload = {
        monto_base: Number(values.montoBase),
        // No editable desde este formulario: se preserva el valor actual (o
        // `true` por defecto al crear el primer aporte de la gestión).
        aporte_activo: aporteVigente?.aporteActivo ?? true,
        fecha_inicio: toFechaBackend(values.fechaInicio),
        fecha_fin: values.tieneFechaFin ? toFechaBackend(values.fechaFin) : null,
      };
      // UPSERT: con id existente → PUT; sin id → POST (gestión vigente la pone el back).
      const resultado = await guardarConfiguracionAporte({
        id: aporteVigente?.id ?? null,
        payload,
      });
      if (resultado?.success) {
        message.success('Aporte de la gestión guardado');
        await refetch();
        return true;
      }
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
      return false;
    },
    [aporteVigente, guardarConfiguracionAporte, message, refetch],
  );

  return {
    form,
    gestionVigente,
    breadcrumbItems,
    aporteVigente,
    loading,
    error,
    refetch,
    saving,
    formSections,
    handleVolver,
    guardarAporte,
  };
};

export default useAportePage;
