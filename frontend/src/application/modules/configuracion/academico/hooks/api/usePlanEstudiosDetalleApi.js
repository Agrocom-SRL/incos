/**
 * HTTP plan de estudios — matriz, validación, vigente, asignaturas y prerrequisitos.
 */

import { useCallback } from 'react';
import apiClient from '@api-client';
import {
  ASIGNATURAS_PLAN_ENDPOINTS,
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
      return { success: true, data: data.plan_estudio ?? data };
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
        return { success: false, error: result.error || 'No se pudo cargar dependientes' };
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

  return {
    fetchPlanById,
    fetchMatriz,
    fetchValidacion,
    marcarVigente,
    actualizarPlan,
    actualizarAsignatura,
    listarPrerrequisitos,
    listarEsPrerrequisitoDe,
    crearPrerrequisito,
    eliminarPrerrequisito,
  };
};
