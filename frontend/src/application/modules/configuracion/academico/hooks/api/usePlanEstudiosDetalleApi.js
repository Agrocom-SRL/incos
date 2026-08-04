/**
 * HTTP plan de estudios — matriz, validación, vigente, asignaturas y prerrequisitos.
 */

import { useCallback, useMemo } from 'react';
import apiClient from '@api-client';
import {
  ASIGNATURAS_PLAN_ENDPOINTS,
  PERIODOS_ENDPOINTS,
  PLANES_ESTUDIOS_ENDPOINTS,
  PRERREQUISITOS_ENDPOINTS,
} from '@api/endpoints';
import { handleErrorResponse, handleSuccessResponse } from '@api/responseHandler';

export const usePlanEstudiosDetalleApi = () => {
  const fetchPlanById = useCallback(async (planId) => {
    try {
      const response = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.BY_ID(planId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo cargar el plan' };
      }
      const data = result.data ?? {};
      return {
        success: true,
        data: data.plan_estudio ?? data,
        prerrequisitos: data.prerrequisitos ?? [],
      };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al cargar el plan de estudios');
      return { success: false, error: fail.error };
    }
  }, []);

  const fetchMatriz = useCallback(async (planId) => {
    try {
      const response = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.MATRIZ(planId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo cargar la matriz' };
      }
      return { success: true, data: result.data ?? {} };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al cargar la matriz del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const fetchValidacion = useCallback(async (planId) => {
    try {
      const response = await apiClient.get(PLANES_ESTUDIOS_ENDPOINTS.VALIDAR(planId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo validar el plan' };
      }
      return { success: true, data: result.data ?? {} };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al validar el plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const crearPlan = useCallback(async (payload) => {
    try {
      const response = await apiClient.post(PLANES_ESTUDIOS_ENDPOINTS.BASE, payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo crear el plan de estudios' };
      }
      return { success: true, data: result.data?.plan_estudio ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al crear plan de estudios');
      return { success: false, error: fail.error };
    }
  }, []);

  const clonarPlan = useCallback(async (planId) => {
    try {
      const response = await apiClient.post(PLANES_ESTUDIOS_ENDPOINTS.CLONAR(planId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo clonar el plan de estudios' };
      }
      return { success: true, data: result.data?.plan_estudio ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al clonar plan de estudios');
      return { success: false, error: fail.error };
    }
  }, []);

  const marcarVigente = useCallback(async (planId) => {
    try {
      const response = await apiClient.post(PLANES_ESTUDIOS_ENDPOINTS.MARCAR_VIGENTE(planId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo marcar el plan como vigente' };
      }
      return { success: true, data: result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al marcar plan vigente');
      return { success: false, error: fail.error };
    }
  }, []);

  const cambiarEstado = useCallback(async (planId, activo) => {
    try {
      const response = await apiClient.patch(PLANES_ESTUDIOS_ENDPOINTS.ESTADO(planId), { activo });
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo cambiar el estado del plan' };
      }
      return { success: true, data: result.data?.plan_estudio ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al cambiar el estado del plan de estudios');
      return { success: false, error: fail.error };
    }
  }, []);

  const actualizarAsignatura = useCallback(async (asignaturaId, payload) => {
    try {
      const response = await apiClient.put(ASIGNATURAS_PLAN_ENDPOINTS.BY_ID(asignaturaId), payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo actualizar la asignatura' };
      }
      return { success: true, data: result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al actualizar asignatura del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const crearAsignaturaPlan = useCallback(async (payload) => {
    try {
      const response = await apiClient.post(ASIGNATURAS_PLAN_ENDPOINTS.BASE, payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo crear la asignatura del plan' };
      }
      return { success: true, data: result.data?.asignatura ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al crear asignatura del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const eliminarAsignaturaPlan = useCallback(async (asignaturaId) => {
    try {
      const response = await apiClient.delete(ASIGNATURAS_PLAN_ENDPOINTS.BY_ID(asignaturaId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo eliminar la asignatura del plan' };
      }
      return { success: true };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al eliminar asignatura del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const crearPeriodo = useCallback(async (planId, payload) => {
    try {
      const response = await apiClient.post(PLANES_ESTUDIOS_ENDPOINTS.PERIODOS(planId), payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo crear el periodo' };
      }
      return { success: true, data: result.data?.periodo ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al crear periodo del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const actualizarPeriodo = useCallback(async (periodoId, payload) => {
    try {
      const response = await apiClient.put(PERIODOS_ENDPOINTS.BY_ID(periodoId), payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo actualizar el periodo' };
      }
      return { success: true, data: result.data?.periodo ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al actualizar periodo del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const eliminarPeriodo = useCallback(async (periodoId) => {
    try {
      const response = await apiClient.delete(PERIODOS_ENDPOINTS.BY_ID(periodoId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo eliminar el periodo' };
      }
      return { success: true };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al eliminar periodo del plan');
      return { success: false, error: fail.error };
    }
  }, []);

  const listarPrerrequisitos = useCallback(async (asignaturaId) => {
    try {
      const response = await apiClient.get(ASIGNATURAS_PLAN_ENDPOINTS.PRERREQUISITOS(asignaturaId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudieron cargar prerrequisitos' };
      }
      return { success: true, data: result.data?.prerrequisitos ?? [] };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al listar prerrequisitos');
      return { success: false, error: fail.error };
    }
  }, []);

  const listarEsPrerrequisitoDe = useCallback(async (asignaturaId) => {
    try {
      const response = await apiClient.get(ASIGNATURAS_PLAN_ENDPOINTS.ES_PRERREQUISITO_DE(asignaturaId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudieron cargar los dependientes' };
      }
      return { success: true, data: result.data?.es_prerrequisito_de ?? [] };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al listar dependientes');
      return { success: false, error: fail.error };
    }
  }, []);

  const crearPrerrequisito = useCallback(async (payload) => {
    try {
      const response = await apiClient.post(PRERREQUISITOS_ENDPOINTS.BASE, payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo crear el prerrequisito' };
      }
      return { success: true, data: result.data?.prerrequisito ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al crear prerrequisito');
      return { success: false, error: fail.error };
    }
  }, []);

  const actualizarPlan = useCallback(async (planId, payload) => {
    try {
      const response = await apiClient.put(PLANES_ESTUDIOS_ENDPOINTS.BY_ID(planId), payload);
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo actualizar el plan' };
      }
      return { success: true, data: result.data?.plan_estudio ?? result.data };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al actualizar plan de estudios');
      return { success: false, error: fail.error };
    }
  }, []);

  const eliminarPrerrequisito = useCallback(async (prerrequisitoId) => {
    try {
      const response = await apiClient.delete(PRERREQUISITOS_ENDPOINTS.BY_ID(prerrequisitoId));
      const result = handleSuccessResponse(response);
      if (!result.success) {
        return { success: false, error: result.error || 'No se pudo eliminar el prerrequisito' };
      }
      return { success: true };
    } catch (error) {
      const fail = handleErrorResponse(error, 'Error al eliminar prerrequisito');
      return { success: false, error: fail.error };
    }
  }, []);

  return useMemo(
    () => ({
      fetchPlanById,
      fetchMatriz,
      fetchValidacion,
      crearPlan,
      clonarPlan,
      marcarVigente,
      cambiarEstado,
      actualizarPlan,
      actualizarAsignatura,
      crearAsignaturaPlan,
      eliminarAsignaturaPlan,
      crearPeriodo,
      actualizarPeriodo,
      eliminarPeriodo,
      listarPrerrequisitos,
      listarEsPrerrequisitoDe,
      crearPrerrequisito,
      eliminarPrerrequisito,
    }),
    [
      fetchPlanById,
      fetchMatriz,
      fetchValidacion,
      crearPlan,
      clonarPlan,
      marcarVigente,
      cambiarEstado,
      actualizarPlan,
      actualizarAsignatura,
      crearAsignaturaPlan,
      eliminarAsignaturaPlan,
      crearPeriodo,
      actualizarPeriodo,
      eliminarPeriodo,
      listarPrerrequisitos,
      listarEsPrerrequisitoDe,
      crearPrerrequisito,
      eliminarPrerrequisito,
    ],
  );
};
