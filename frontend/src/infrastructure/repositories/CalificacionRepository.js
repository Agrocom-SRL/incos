/**
 * Repositorio HTTP — módulo Calificaciones (coordinación).
 */

import apiClient from '@api-client';
import { CALIFICACIONES_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

class CalificacionRepository {
  /**
   * GET /v1/calificaciones/coordinacion/docentes
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   * @returns {Promise<{success: boolean, data?: { gestionVigente, bimestreVigente, docentes }, error?: string}>}
   */
  async listarCoordinacionDocentes(options = {}) {
    try {
      const { q = '', limit, preliminar } = options;
      const params = {};
      if (preliminar) {
        params.preliminar = '1';
      } else if (String(q).trim().length >= 2) {
        params.q = String(q).trim();
      } else {
        params.preliminar = '1';
      }
      if (limit != null) params.limit = limit;

      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.COORDINACION_DOCENTES, { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      const payload = responseData.data ?? {};
      return {
        success: true,
        data: {
          gestionVigente: payload.gestionVigente ?? null,
          bimestreVigente: payload.bimestreVigente ?? null,
          docentes: Array.isArray(payload.docentes) ? payload.docentes : [],
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar docentes de coordinación');
    }
  }

  /**
   * GET /v1/calificaciones/politica/catalogo
   */
  async obtenerPoliticaCatalogo() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.POLITICA_CATALOGO);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data?.catalogo ?? responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar catálogo de política');
    }
  }

  /**
   * GET /v1/calificaciones/politica
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async obtenerPoliticaInstitucional() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.POLITICA);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la configuración de notas');
    }
  }

  /**
   * PUT /v1/calificaciones/politica
   * @param {Object} cambios
   */
  /**
   * GET /v1/calificaciones/mis-cursos
   */
  async listarMisCursos() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.MIS_CURSOS);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar tus cursos');
    }
  }

  /**
   * GET /v1/calificaciones/coordinacion/docentes/:docenteId/cursos
   */
  async listarCursosDocenteCoordinacion(docenteId) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.COORDINACION_DOCENTE_CURSOS(docenteId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los cursos del docente');
    }
  }

  async guardarPoliticaInstitucional(cambios) {
    try {
      const response = await apiClient.put(CALIFICACIONES_ENDPOINTS.POLITICA, cambios);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar la configuración de notas');
    }
  }

  /** GET /v1/calificaciones/asignaciones/:asignacionId/notas */
  async obtenerRegistroNotas(asignacionId) {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.REGISTRO_NOTAS(asignacionId));
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el registro de notas');
    }
  }

  /** GET /v1/calificaciones/gestion-bimestres */
  async obtenerGestionBimestres() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.GESTION_BIMESTRES);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la gestión de bimestres');
    }
  }

  /** POST /v1/calificaciones/gestion-bimestres/iniciar */
  async iniciarGestionAcademica() {
    try {
      const response = await apiClient.post(CALIFICACIONES_ENDPOINTS.GESTION_BIMESTRES_INICIAR);
      const responseData = response.data;
      if (responseData.success === false) {
        return {
          success: false,
          error: responseData.error,
          code: responseData.code,
        };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      const mapped = handleErrorResponse(error, 'Error al iniciar la gestión académica');
      if (error?.response?.data?.code) mapped.code = error.response.data.code;
      return mapped;
    }
  }

  /** GET /v1/calificaciones/gestion-bimestres/bimestre/:n/validar-cierre */
  async validarCierreBimestre(numero) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.GESTION_BIMESTRES_VALIDAR_CIERRE(numero),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al validar el cierre del bimestre');
    }
  }

  /** POST /v1/calificaciones/gestion-bimestres/bimestre/:n/cerrar */
  async cerrarBimestreGestion(numero) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.GESTION_BIMESTRES_CERRAR(numero),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return {
          success: false,
          error: responseData.error,
          code: responseData.code,
        };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      const mapped = handleErrorResponse(error, 'Error al cerrar el bimestre');
      if (error?.response?.data?.code) mapped.code = error.response.data.code;
      if (error?.response?.data?.data?.validacion) {
        mapped.validacion = error.response.data.data.validacion;
      }
      return mapped;
    }
  }

  /** GET cuaderno del bimestre (evaluaciones + notas cargadas). */
  async obtenerCuadernoBimestre(asignacionId, bimestre) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.CUADERNO_BIMESTRE(asignacionId, bimestre),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el cuaderno');
    }
  }

  async crearEvaluacionCuaderno(asignacionId, bimestre, payload) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.CUADERNO_EVALUACIONES(asignacionId, bimestre),
        payload,
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la evaluación');
    }
  }

  async editarEvaluacionCuaderno(asignacionId, bimestre, evaluacionId, payload) {
    try {
      const response = await apiClient.put(
        CALIFICACIONES_ENDPOINTS.CUADERNO_EVALUACION(asignacionId, bimestre, evaluacionId),
        payload,
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la evaluación');
    }
  }

  /**
   * POST guardar lote + recalcular bimestre y nota_final.
   * @param {Array<{ estudianteId: number, evaluacionId: number, nota: number|null }>} notas
   */
  async guardarNotasCuadernoBimestre(asignacionId, bimestre, notas = []) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.CUADERNO_GUARDAR(asignacionId, bimestre),
        { notas },
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar las notas del cuaderno');
    }
  }

  /** PUT celda del cuaderno (carga perezosa en evaluaciones_notas). */
  async guardarNotaCuaderno(asignacionId, bimestre, payload) {
    try {
      const response = await apiClient.put(
        CALIFICACIONES_ENDPOINTS.CUADERNO_NOTA(asignacionId, bimestre),
        payload,
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data?.nota ?? responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al guardar la nota');
    }
  }

  async resetearNotasEvaluacionCuaderno(asignacionId, bimestre, evaluacionId) {
    try {
      const response = await apiClient.delete(
        CALIFICACIONES_ENDPOINTS.CUADERNO_EVALUACION_NOTAS(asignacionId, bimestre, evaluacionId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al restablecer las notas');
    }
  }

  async eliminarEvaluacionCuaderno(asignacionId, bimestre, evaluacionId) {
    try {
      const response = await apiClient.delete(
        CALIFICACIONES_ENDPOINTS.CUADERNO_EVALUACION(asignacionId, bimestre, evaluacionId),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la evaluación');
    }
  }

}

export default new CalificacionRepository();
