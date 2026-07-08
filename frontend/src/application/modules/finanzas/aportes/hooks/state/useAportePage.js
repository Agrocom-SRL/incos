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

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
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
const createAporteFormSections = () => ({
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
        name: 'fechaFin',
        label: 'Fecha de fin de vigencia (opcional)',
        type: 'date',
        span: 12,
        extra: 'Déjelo vacío si el aporte no tiene fecha límite dentro de la gestión.',
      },
      {
        name: 'aporteActivo',
        label: 'Aporte activo',
        type: 'switch',
        span: 12,
        checkedChildren: 'Activo',
        unCheckedChildren: 'Inactivo',
      },
    ],
  },
});

export const useAportePage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { gestionVigente, aporteVigente, loading, error, refetch, saving, guardarConfiguracionAporte } =
    useAporteContext();

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('FIN-CFG-APORTES', 'FIN', 'Aportes'),
    [],
  );

  const formSections = useMemo(() => createAporteFormSections(), []);

  const handleVolver = useCallback(() => {
    const returnTab = location.state?.returnTab;
    navigate(returnTab ? `${CONFIGURACION_PATH}?tab=${returnTab}` : CONFIGURACION_PATH);
  }, [navigate, location.state]);

  const guardarAporte = useCallback(
    async (values) => {
      const payload = {
        monto_base: Number(values.montoBase),
        aporte_activo: !!values.aporteActivo,
        fecha_inicio: toFechaBackend(values.fechaInicio),
        fecha_fin: toFechaBackend(values.fechaFin),
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
