/**
 * Implementación del Repositorio de Pagos de Aporte
 * Implementa IPagoAporteRepository usando API client
 * 
 * Single Responsibility: Solo maneja llamadas HTTP para pagos de aporte
 * Liskov Substitution Principle: Puede reemplazar IPagoAporteRepository
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend
 */

import apiClient from '@api-client';
import { IPagoAporteRepository } from '@domain/repositories';
import { PAGOS_APORTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

export class PagoAporteRepository extends IPagoAporteRepository {
  /**
   * Registra un nuevo pago de aporte académico
   * POST /v1/pagos-aportes
   * 
   * @param {Object} data - Datos del pago a registrar
   * @param {number} data.student_id - ID del estudiante
   * @param {number} data.payment_method_id - ID del método de pago (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA, 4=DEPOSITO)
   * @param {number|null} data.payment_account_id - ID de la cuenta de pago (NULL para EFECTIVO, opcional para QR, requerido para TRANSFERENCIA/DEPOSITO)
   * @param {string|null} data.payment_date - Fecha del pago (YYYY-MM-DD, requerida para QR/TRANSFERENCIA/DEPOSITO)
   * @param {string|null} data.transaction_number - Número de transacción (opcional)
   * @param {string|null} data.codigo_comprobante - Código del comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO)
   * @param {string|null} data.descripcion - Descripción del pago (opcional)
   * @param {File|null} data.documentoRespaldo - Archivo de documento de respaldo (opcional)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarPago(data) {
    try {
      // Validar datos requeridos
      if (!data.student_id) {
        return {
          success: false,
          error: 'El ID del estudiante es requerido',
        };
      }

      if (!data.payment_method_id) {
        return {
          success: false,
          error: 'El ID del método de pago es requerido',
        };
      }

      // Monto de la cuota (requerido por el backend). Si no viene, 0 (p. ej. pago gratuito).
      const amount = data.amount != null && !Number.isNaN(Number(data.amount)) ? Number(data.amount) : 0;

      // Si hay un archivo, usar FormData, sino usar JSON normal
      let requestData;
      let headers = {};

      // Debug: Log del archivo recibido
      console.log('[PagoAporteRepository] Verificando archivo', {
        hasDocumentoRespaldo: !!data.documentoRespaldo,
        isFile: data.documentoRespaldo instanceof File,
        tipo: typeof data.documentoRespaldo,
        constructor: data.documentoRespaldo?.constructor?.name,
        fileInfo: data.documentoRespaldo ? {
          name: data.documentoRespaldo.name,
          size: data.documentoRespaldo.size,
          type: data.documentoRespaldo.type,
        } : null,
      });

      if (data.documentoRespaldo && data.documentoRespaldo instanceof File) {
        // Usar FormData para enviar archivo
        const formData = new FormData();
        formData.append('student_id', data.student_id);
        formData.append('amount', String(amount));
        formData.append('payment_method_id', data.payment_method_id);
        if (data.payment_account_id) {
          formData.append('payment_account_id', data.payment_account_id);
        }
        if (data.payment_date) {
          formData.append('payment_date', data.payment_date);
        }
        if (data.transaction_number) {
          formData.append('transaction_number', data.transaction_number);
        }
        const codigoComprobante = data.codigo_comprobante || data.codigoComprobante;
        if (codigoComprobante) {
          formData.append('codigo_comprobante', codigoComprobante);
        }
        if (data.descripcion) {
          formData.append('descripcion', data.descripcion);
        }
        formData.append('documentoRespaldo', data.documentoRespaldo);

        console.log('[PagoAporteRepository] Enviando FormData con archivo', {
          fileName: data.documentoRespaldo.name,
          fileSize: data.documentoRespaldo.size,
        });

        requestData = formData;
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
      } else {
        // Usar JSON normal (management_id no se envía; el backend usa la gestión vigente)
        const codigoComprobante = data.codigo_comprobante || data.codigoComprobante;
        requestData = {
          student_id: data.student_id,
          amount,
          payment_method_id: data.payment_method_id,
          payment_account_id: data.payment_account_id || null,
          payment_date: data.payment_date || null,
          transaction_number: data.transaction_number || null,
          codigo_comprobante: codigoComprobante || null,
          descripcion: data.descripcion || null,
        };
        headers['Content-Type'] = 'application/json';
      }

      // Llamada HTTP directa al endpoint
      // Si es FormData, no establecer headers (axios lo hará automáticamente con el boundary)
      const config = data.documentoRespaldo && data.documentoRespaldo instanceof File
        ? {} // Sin headers, axios establecerá Content-Type automáticamente para FormData
        : { headers }; // Para JSON, usar headers con Content-Type

      const response = await apiClient.post(PAGOS_APORTES_ENDPOINTS.BASE, requestData, config);

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar pago de aporte');
    }
  }

  /**
   * Obtiene el estado actual del aporte de un estudiante para el formulario de registro de pago.
   * GET /v1/pagos-aportes/estado-registro?estudiante_id=&gestion_id=
   *
   * @param {number} estudianteId - ID del estudiante (requerido)
   * @param {number|null} [gestionId] - ID de la gestión (opcional; si no se envía, se usa la vigente)
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerEstadoRegistro(estudianteId, gestionId = null) {
    try {
      if (!estudianteId || Number(estudianteId) < 1) {
        return { success: false, error: 'estudiante_id es requerido y debe ser mayor a 0' };
      }
      const params = { estudiante_id: Number(estudianteId) };
      if (gestionId != null && gestionId !== '') {
        params.gestion_id = Number(gestionId);
      }
      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.ESTADO_REGISTRO, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener estado del aporte para registro');
    }
  }

  /**
   * GET /v1/pagos-aportes/buscar-estudiantes-registro
   * @param {Object} options
   * @param {string} [options.q] - Búsqueda (min. 2 caracteres) salvo con preliminar
   * @param {number} [options.limit]
   * @param {boolean} [options.preliminar] - Muestra estudiantes con saldo en cabeceras (sin q)
   */
  async buscarEstudiantesRegistroAporte(options = {}) {
    try {
      const { q = '', limit, preliminar } = options;
      const params = {};
      if (preliminar) {
        params.preliminar = '1';
      } else {
        params.q = String(q).trim();
      }
      if (limit != null) params.limit = limit;
      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.BUSCAR_ESTUDIANTES_REGISTRO, { params });
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
   * Obtiene la lista de pagos de aportes con filtros y paginación (vista_pago_aporte_listado).
   * GET /v1/pagos-aportes?page=1&limit=50&search=...&sort=id:ASC&gestion_id=&estudiante_id=&estado=
   *
   * @param {Object} options - Opciones de consulta
   * @param {Object} options.params - Parámetros de consulta HTTP (page, limit, search, sort, gestion_id, estudiante_id, estado)
   * @returns {Promise<{success: boolean, data?: Array, pagination?: {page, limit, total, totalPages}, error?: string}>}
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;

      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.BASE, { params });
      const responseData = response.data;

      if (responseData.success === false) {
        return {
          success: false,
          error: responseData.error || 'Error en la respuesta del servidor',
        };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }

      const data = Array.isArray(responseData.data) ? responseData.data : [];
      const pagination = responseData.pagination || null;

      return { success: true, data, pagination };
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener pagos de aportes');
    }
  }

  /**
   * Obtiene un pago de aporte por ID con todos sus datos relacionados
   * GET /v1/pagos-aportes/:id
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPorId(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del pago es requerido',
        };
      }

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.BY_ID(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener pago de aporte');
    }
  }

  /**
   * Elimina un pago de aporte por ID (soft delete)
   * DELETE /v1/pagos-aportes/:id
   * 
   * @param {string|number} id - ID del pago a eliminar
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async eliminar(id) {
    try {
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del pago es requerido',
        };
      }
      const response = await apiClient.delete(PAGOS_APORTES_ENDPOINTS.BY_ID(id));
      const result = handleSuccessResponse(response);
      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar pago de aporte');
    }
  }

  /**
   * PUT /v1/pagos-aportes/cuotas/:id
   * @param {string|number} cuotaId - ID de pago_cuotas
   * @param {Object} payload - Campos de la cuota (amount, payment_method_id, …)
   */
  async actualizarCuota(cuotaId, payload) {
    try {
      if (!cuotaId || (typeof cuotaId !== 'string' && typeof cuotaId !== 'number')) {
        return { success: false, error: 'ID de cuota es requerido' };
      }
      const body = {
        amount: payload.amount,
        payment_method_id: payload.payment_method_id,
        payment_account_id: payload.payment_account_id ?? null,
        payment_date: payload.payment_date,
        transaction_number: payload.transaction_number ?? null,
        codigo_comprobante: payload.codigo_comprobante ?? null,
        descripcion: payload.descripcion ?? null,
      };
      const response = await apiClient.put(PAGOS_APORTES_ENDPOINTS.UPDATE_CUOTA(cuotaId), body, {
        headers: { 'Content-Type': 'application/json' },
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la cuota de pago');
    }
  }

  /**
   * Genera u obtiene el recibo de pago de un aporte académico
   * GET /v1/pagos-aportes/:id/recibo
   * 
   * Verifica si el recibo ya existe en documentos_estudiante:
   * - Si existe, retorna la información del archivo existente
   * - Si no existe, genera el recibo y lo guarda en documentos_estudiante
   * 
   * @param {string|number} id - ID del pago
   * @returns {Promise<{success: boolean, data?: {filePath: string, fileName: string, absolutePath: string}, error?: string}>}
   */
  async generarRecibo(id) {
    try {
      // Validar que el ID sea válido
      if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        return {
          success: false,
          error: 'ID del pago es requerido',
        };
      }

      // Llamada HTTP directa al endpoint
      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.GENERATE_RECIBO(id));

      // Procesar respuesta exitosa
      const result = handleSuccessResponse(response);

      return result;
    } catch (error) {
      return handleErrorResponse(error, 'Error al generar recibo de pago');
    }
  }

  /**
   * Descarga Excel de estado de aporte por carrera (una hoja por paralelo).
   * @param {Object} options
   * @param {string|number} options.carreraId
   * @param {string|number} [options.gestionId]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarListaAportesPorCarreraExcel(options = {}) {
    try {
      if (options.carreraId == null || options.carreraId === '') {
        return { success: false, error: 'carreraId es requerido' };
      }
      const params = { carrera_id: options.carreraId };
      if (options.gestionId != null && options.gestionId !== '') {
        params.gestion_id = options.gestionId;
      }

      const response = await apiClient.get(PAGOS_APORTES_ENDPOINTS.EXPORT_LISTA_POR_CARRERA, {
        params,
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'lista_aportes.xlsx';
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
              : errObj?.message || json?.message || 'Error al exportar lista de aportes';
          return { success: false, error: msg };
        } catch {
          return { success: false, error: 'Error al exportar lista de aportes' };
        }
      }
      return handleErrorResponse(error, 'Error al exportar lista de aportes');
    }
  }
}

export default new PagoAporteRepository();
