/**
 * Implementación del Repositorio de Estudiantes
 * Implementa IEstudianteRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para estudiantes
 * Liskov Substitution Principle: Puede reemplazar IEstudianteRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IEstudianteRepository } from '@domain/repositories';
import { ESTUDIANTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class EstudianteRepository extends IEstudianteRepository {
  /**
   * Obtiene la lista de estudiantes con filtros y paginación
   * GET /v1/estudiantes?pagina=1&limite=10&busqueda=...
   * 
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  /**
   * Descarga Excel de estadística de inscritos (gestión vigente o gestion_id en query).
   * @param {Object} [options]
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarEstadisticaInscritosExcel(options = {}) {
    try {
      const params = {};
      if (options.gestionId != null && options.gestionId !== '') {
        params.gestion_id = options.gestionId;
      }

      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.EXPORT_ESTADISTICA_INSCRITOS, {
        params,
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'estadistica_inscritos.xlsx';
      if (starMatch) {
        try {
          fileName = decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
        } catch {
          fileName = starMatch[1];
        }
      } else if (quotedMatch) {
        fileName = quotedMatch[1];
      } else if (plainMatch) {
        fileName = plainMatch[1].replace(/['"]/g, '');
      }

      return {
        success: true,
        blob: response.data,
        fileName,
      };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const errObj = json?.error;
          const msg =
            typeof errObj === 'string'
              ? errObj
              : errObj?.message || json?.message || 'Error al exportar estadística de inscritos';
          return { success: false, error: msg };
        } catch {
          return { success: false, error: 'Error al exportar estadística de inscritos' };
        }
      }
      return handleErrorResponse(error, 'Error al exportar estadística de inscritos');
    }
  }

  /**
   * Descarga Excel de lista de inscritos por carrera (hojas por paralelo).
   * @param {Object} options
   * @param {string|number} options.carreraId
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarListaInscritosPorCarreraExcel(options = {}) {
    try {
      const params = {};
      if (options.carreraId == null || options.carreraId === '') {
        return { success: false, error: 'carreraId es requerido' };
      }
      params.carrera_id = options.carreraId;
      if (options.gestionId != null && options.gestionId !== '') {
        params.gestion_id = options.gestionId;
      }

      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.EXPORT_LISTA_INSCRITOS_POR_CARRERA, {
        params,
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'lista_inscritos.xlsx';
      if (starMatch) {
        try {
          fileName = decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
        } catch {
          fileName = starMatch[1];
        }
      } else if (quotedMatch) {
        fileName = quotedMatch[1];
      } else if (plainMatch) {
        fileName = plainMatch[1].replace(/['"]/g, '');
      }

      return {
        success: true,
        blob: response.data,
        fileName,
      };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const errObj = json?.error;
          const msg =
            typeof errObj === 'string'
              ? errObj
              : errObj?.message || json?.message || 'Error al exportar lista de inscritos';
          return { success: false, error: msg };
        } catch {
          return { success: false, error: 'Error al exportar lista de inscritos' };
        }
      }
      return handleErrorResponse(error, 'Error al exportar lista de inscritos');
    }
  }

  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.BASE, { params });

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      // Asegurar que data sea un array
      if (result.success && result.data) {
        result.data = Array.isArray(result.data) ? result.data : [];
      }

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estudiantes');
    }
  }


  /**
   * Obtiene un estudiante por ID
   * GET /v1/estudiantes/:id
   * 
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del estudiante es requerido',
        };
      }

      // Llamada HTTP directa al endpoint usando BY_ID que usa BASE
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.BY_ID(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estudiante');
    }
  }

  /**
   * Portal del estudiante: ficha completa (solo lectura) del estudiante AUTENTICADO.
   * GET /v1/estudiantes/mis-datos
   *
   * El backend resuelve al estudiante desde el token; no recibe id.
   *
   * @returns {Promise<{success: boolean, data?: { student, guardians, origins, academicData, inscripcion }, error?: string}>}
   */
  async obtenerMisDatos() {
    try {
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.MIS_DATOS);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener tus datos');
    }
  }

  /**
   * Crea un nuevo estudiante
   * POST /v1/estudiantes
   *
   * @param {Object} data - Datos del estudiante a crear
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async crear(data) {
    try {
      // Llamada HTTP directa al endpoint
      const response = await apiClient.post(ESTUDIANTES_ENDPOINTS.BASE, data);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear estudiante');
    }
  }

  /**
   * Actualiza un estudiante existente
   * PUT /v1/estudiantes/:id
   * 
   * @param {string|number} id - ID del estudiante a actualizar
   * @param {Object} data - Datos del estudiante a actualizar
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async actualizar(id, data) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del estudiante es requerido',
        };
      }

      // Llamada HTTP directa al endpoint PUT
      const response = await apiClient.put(ESTUDIANTES_ENDPOINTS.BY_ID(id), data);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar estudiante');
    }
  }

  /**
   * Busca estudiantes por término de búsqueda
   * GET /v1/estudiantes/search?query=termino&limit=50
   * 
   * @param {string} terminoBusqueda - Término de búsqueda (texto libre)
   * @param {Object} options - Opciones opcionales
   * @param {Object} options.params - Parámetros adicionales de consulta HTTP
   * @param {number} options.params.limit - Límite de resultados (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async buscar(terminoBusqueda, options = {}) {
    try {
      const { params = {} } = options;
      
      // Construir parámetros de consulta
      const queryParams = {
        query: terminoBusqueda,
        ...(params.limit && { limit: params.limit }),
      };

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.SEARCH, { params: queryParams });

      // Procesar respuesta usando handleSuccessResponse
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al buscar estudiantes');
    }
  }

  /**
   * GET /v1/estudiantes/buscar-asignacion-beca
   * @param {Object} options
   * @param {string} [options.q]
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar]
   */
  async buscarAsignacionBeca(options = {}) {
    try {
      const { q = '', limit, preliminar } = options;
      const params = {};
      if (preliminar) {
        params.preliminar = '1';
      } else {
        params.q = String(q).trim();
      }
      if (limit != null) params.limit = limit;
      const response = await apiClient.get(ESTUDIANTES_ENDPOINTS.BUSCAR_ASIGNACION_BECA, { params });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      const data = Array.isArray(responseData.data) ? responseData.data : [];
      return { success: true, data };
    } catch (error) {
      return handleErrorResponse(error, 'Error al buscar estudiantes');
    }
  }

  /**
   * Elimina un estudiante por ID (soft delete)
   * DELETE /v1/estudiantes/:id
   * 
   * @param {string|number} id - ID del estudiante a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del estudiante es requerido',
        };
      }
      const response = await apiClient.delete(ESTUDIANTES_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar estudiante');
    }
  }

}

export default new EstudianteRepository();

