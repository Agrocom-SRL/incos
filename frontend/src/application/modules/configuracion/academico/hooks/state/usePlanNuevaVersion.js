/**
 * "Nueva versión (RM)" de un plan de estudio — clona el plan vigente
 * (`clonarPlan`) y navega a editar la copia (`planEditarPath`).
 *
 * Reutilizado desde:
 *   - `PlanesTabPanel.jsx` (tab de solo listado/selección, Fase 9): clona el
 *     plan vigente de la carrera seleccionada sin pasar por la ficha-hub.
 *   - `usePlanDetallePage.js` (ficha-hub, Fase 8): clona el plan mostrado en
 *     la ficha; ver `handleNuevaVersion` ahí, que solo resuelve el `planId`
 *     desde el `plan` cargado y delega en este hook.
 *
 * El plan destino nace `vigente=false` (borrador) — el backend
 * (`ClonarPlanEstudiosUseCase`) ya clona periodos/asignaturas/prerrequisitos.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePlanEstudiosDetalleApi } from '@application-configuracion/academico/hooks/api/usePlanEstudiosDetalleApi';
import { planEditarPath } from '@application-configuracion/academico/config/paths';

export const usePlanNuevaVersion = ({ navState } = {}) => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { clonarPlan } = usePlanEstudiosDetalleApi();

  const [creandoVersion, setCreandoVersion] = useState(false);

  const crearNuevaVersion = useCallback(
    async (planId) => {
      if (!planId) return null;
      setCreandoVersion(true);
      try {
        const result = await clonarPlan(planId);
        if (!result.success) {
          throw new Error(result.error || 'No se pudo clonar el plan de estudios');
        }
        const nuevoPlanId = result.data?.id ?? null;
        notification.success({
          title: 'Nueva versión creada',
          description: 'Edite los datos generales y la matriz de la copia.',
        });
        if (nuevoPlanId) {
          navigate(planEditarPath(nuevoPlanId), navState ? { state: navState } : undefined);
        }
        return nuevoPlanId;
      } catch (e) {
        notification.error({ title: 'Error al crear la nueva versión', description: e?.message });
        return null;
      } finally {
        setCreandoVersion(false);
      }
    },
    [clonarPlan, notification, navigate, navState],
  );

  return { creandoVersion, crearNuevaVersion };
};
