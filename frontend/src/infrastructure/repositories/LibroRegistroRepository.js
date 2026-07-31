/**
 * Repositorio HTTP — Libros de registro (Académico · /academico/libros).
 *
 * Cada método desenvuelve el `dataFieldName` literal que devuelve el backend
 * (`libros`, `libro`, `paralelos`, `folios`, `folio`, `folioEstudiante`) — el
 * contrato dataKey (front) == dataFieldName (back) se resuelve AQUÍ, no en los
 * use cases ni en los hooks. Patrón calcado de `CalificacionRepository`
 * (Centralizador): sin interfaz de dominio, exportado como instancia única.
 */

import apiClient from '@api-client';
import { LIBROS_ENDPOINTS } from '@api/endpoints';
import { handleErrorResponse } from '@api/responseHandler';

/** Lee `{success,data,error}` del backend con el manejo estándar de errores. */
const unwrap = (response) => {
  const responseData = response.data;
  if (responseData.success === false) {
    return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
  }
  if (responseData.error) {
    return { success: false, error: responseData.error };
  }
  return { success: true, data: responseData.data ?? {} };
};

class LibroRegistroRepository {
  /**
   * GET /v1/libros?carreraId&gestionId
   * @param {{ carreraId?: number, gestionId?: number }} [params]
   * @returns {Promise<{success:boolean,data?:Array,error?:string}>}
   */
  async listar(params = {}) {
    try {
      const response = await apiClient.get(LIBROS_ENDPOINTS.BASE, { params });
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: Array.isArray(result.data.libros) ? result.data.libros : [] };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los libros de registro');
    }
  }

  /**
   * POST /v1/libros — abre un libro (carrera + gestión + numeroLibro obligatorios).
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:Object,error?:string}>}
   */
  async abrir(payload) {
    try {
      const response = await apiClient.post(LIBROS_ENDPOINTS.BASE, payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.libro ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al abrir el libro de registro');
    }
  }

  /**
   * GET /v1/libros/:id — cabecera del libro + folios[].
   * @param {number} id
   */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(LIBROS_ENDPOINTS.BY_ID(id));
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.libro ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el libro de registro');
    }
  }

  /**
   * PATCH /v1/libros/:id — edita cabecera (incluye cierre/reapertura por `estado`).
   * @param {number} id
   * @param {Object} payload
   */
  async editar(id, payload) {
    try {
      const response = await apiClient.patch(LIBROS_ENDPOINTS.BY_ID(id), payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.libro ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el libro de registro');
    }
  }

  /**
   * GET /v1/libros/:id/paralelos — candidatos del generador de folios.
   * @param {number} id
   */
  async listarParalelos(id) {
    try {
      const response = await apiClient.get(LIBROS_ENDPOINTS.PARALELOS(id));
      const result = unwrap(response);
      if (!result.success) return result;
      return {
        success: true,
        data: Array.isArray(result.data.paralelos) ? result.data.paralelos : [],
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los paralelos del libro');
    }
  }

  /**
   * POST /v1/libros/:id/folios — genera los folios de un paralelo.
   * @param {number} id
   * @param {{ paraleloGestionId: number, fechaRegistro?: string }} payload
   */
  async generarFolios(id, payload) {
    try {
      const response = await apiClient.post(LIBROS_ENDPOINTS.FOLIOS(id), payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: Array.isArray(result.data.folios) ? result.data.folios : [] };
    } catch (error) {
      return handleErrorResponse(error, 'Error al generar los folios del paralelo');
    }
  }

  /**
   * GET /v1/libros/:id/folios/:folioId — detalle del folio (nómina + celdas).
   * @param {number} id
   * @param {number} folioId
   */
  async obtenerFolio(id, folioId) {
    try {
      const response = await apiClient.get(LIBROS_ENDPOINTS.FOLIO_BY_ID(id, folioId));
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.folio ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el folio');
    }
  }

  /**
   * PATCH /v1/libros/:id/folios/:folioId/estado — BORRADOR→IMPRESO→FIRMADO / ANULADO.
   * @param {number} id
   * @param {number} folioId
   * @param {{ estado: string, motivo?: string }} payload
   */
  async cambiarEstadoFolio(id, folioId, payload) {
    try {
      const response = await apiClient.patch(LIBROS_ENDPOINTS.FOLIO_ESTADO(id, folioId), payload);
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.folio ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado del folio');
    }
  }

  /**
   * PATCH /v1/libros/:id/folios/:folioId/estudiantes/:filaId — ESTADO/OBSERVACIONES.
   * @param {number} id
   * @param {number} folioId
   * @param {number} filaId
   * @param {{ estadoAcademico?: string|null, observaciones?: string|null }} payload
   */
  async editarFolioEstudiante(id, folioId, filaId, payload) {
    try {
      const response = await apiClient.patch(
        LIBROS_ENDPOINTS.FOLIO_ESTUDIANTE(id, folioId, filaId),
        payload,
      );
      const result = unwrap(response);
      if (!result.success) return result;
      return { success: true, data: result.data.folioEstudiante ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la fila del folio');
    }
  }

  /**
   * GET /v1/libros/:id/export — descarga el libro completo en Excel (.xlsx).
   * Mecánica idéntica a `CalificacionRepository.descargarCentralizadorExcel`
   * (blob + filename del header `Content-Disposition`).
   * @param {number} id
   * @returns {Promise<{success:boolean,blob?:Blob,fileName?:string,error?:string}>}
   */
  async exportar(id) {
    try {
      const response = await apiClient.get(LIBROS_ENDPOINTS.EXPORT(id), {
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'libro_registro.xlsx';
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

      return { success: true, blob: response.data, fileName };
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const errObj = json?.error;
          const msg =
            typeof errObj === 'string'
              ? errObj
              : errObj?.message || json?.message || 'Error al exportar el libro de registro';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar el libro de registro');
    }
  }
}

export default new LibroRegistroRepository();
