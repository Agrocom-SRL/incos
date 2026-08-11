/**
 * Implementación del Repositorio de Pasantías (módulo TUT · Titulación)
 * Implementa IPasantiaRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para pasantías y sus
 * satélites (empresas, informes, seguimientos).
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend (camelCase, mappers pasantías del backend)
 *
 * Contrato P1-P19: docs/plan/titulacion-y-dominios-pendientes.md §Fase 2
 * (dataFieldName literales).
 */

import apiClient from '@api-client';
import { IPasantiaRepository } from '@domain/repositories';
import { PASANTIAS_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

/** Nombre de archivo desde Content-Disposition (patrón ProyectoGradoRepository). */
const parseFileName = (response, fallback) => {
  const disposition = response.headers?.['content-disposition'] || '';
  const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
  const quotedMatch = disposition.match(/filename="([^"]+)"/i);
  const plainMatch = disposition.match(/filename=([^;\s]+)/i);
  if (starMatch) {
    try {
      return decodeURIComponent(starMatch[1].replace(/['"]/g, ''));
    } catch {
      return starMatch[1];
    }
  }
  if (quotedMatch) return quotedMatch[1];
  if (plainMatch) return plainMatch[1].replace(/['"]/g, '');
  return fallback;
};

/** Error de una respuesta blob fallida (el backend responde JSON dentro del blob). */
const parseBlobError = async (error, fallbackMessage) => {
  if (error.response?.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      const json = JSON.parse(text);
      const errObj = json?.error;
      const msg = typeof errObj === 'string' ? errObj : errObj?.message || json?.message;
      return { success: false, error: msg || fallbackMessage };
    } catch {
      return { success: false, error: fallbackMessage };
    }
  }
  return handleErrorResponse(error, fallbackMessage);
};

export class PasantiaRepository extends IPasantiaRepository {
  /**
   * Listado de trámites (P1, vista 167, `pasantias`).
   * GET /v1/pasantias?search=&carreraId=&gestionId=&estado=&tipo=
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.BASE, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los trámites de pasantía');
    }
  }

  /** Ficha del trámite (P2, vista 168, `pasantia`). GET /v1/pasantias/:id */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el trámite de pasantía');
    }
  }

  /** Registra el trámite — PASANTIA | CONVALIDACION (P3, `pasantia`). POST /v1/pasantias */
  async crear(data) {
    try {
      const response = await apiClient.post(PASANTIAS_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar el trámite de pasantía');
    }
  }

  /** Actualiza el trámite (P4, `pasantia`). PUT /v1/pasantias/:id */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(PASANTIAS_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el trámite de pasantía');
    }
  }

  /** Elimina (soft delete) el trámite (P5). DELETE /v1/pasantias/:id */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(PASANTIAS_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el trámite de pasantía');
    }
  }

  /** Transición de estado por camino (P6, APROBAR, `pasantia`). POST /v1/pasantias/:id/transiciones */
  async transicionar(id, data) {
    try {
      const response = await apiClient.post(PASANTIAS_ENDPOINTS.TRANSICIONES(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la transición del trámite');
    }
  }

  /** Catálogo de empresas (P7, `pasantiasEmpresas`). GET /v1/pasantias/empresas?incluirInactivos= */
  async obtenerEmpresas(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.EMPRESAS, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las empresas de pasantía');
    }
  }

  /** Ficha de empresa (P20, `pasantiaEmpresa`). GET /v1/pasantias/empresas/:empresaId */
  async obtenerEmpresaPorId(empresaId) {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.EMPRESA(empresaId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la empresa de pasantía');
    }
  }

  /** Alta de empresa (P8, `pasantiaEmpresa`). POST /v1/pasantias/empresas */
  async crearEmpresa(data) {
    try {
      const response = await apiClient.post(PASANTIAS_ENDPOINTS.EMPRESAS, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la empresa');
    }
  }

  /** Edición de empresa (P9, `pasantiaEmpresa`). PUT /v1/pasantias/empresas/:empresaId */
  async actualizarEmpresa(empresaId, data) {
    try {
      const response = await apiClient.put(PASANTIAS_ENDPOINTS.EMPRESA(empresaId), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la empresa');
    }
  }

  /**
   * Activa/desactiva una empresa (P10, ACTIVAR, `pasantiaEmpresa`).
   * PATCH /v1/pasantias/empresas/:empresaId/estado — body { activo }
   */
  async cambiarEstadoEmpresa(empresaId, activo) {
    try {
      const response = await apiClient.patch(PASANTIAS_ENDPOINTS.EMPRESA_ESTADO(empresaId), {
        activo,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al cambiar el estado de la empresa');
    }
  }

  /** Elimina (soft) una empresa del catálogo (P21). DELETE /v1/pasantias/empresas/:empresaId */
  async eliminarEmpresa(empresaId) {
    try {
      const response = await apiClient.delete(PASANTIAS_ENDPOINTS.EMPRESA(empresaId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la empresa');
    }
  }

  /** Bandeja del docente supervisor autenticado (P18, `misPasantias`). GET /v1/pasantias/mis-pasantias */
  async obtenerMisPasantias() {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.MIS_PASANTIAS);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener sus pasantías supervisadas');
    }
  }

  /**
   * Trámite compuesto del estudiante autenticado (P19,
   * `{ pasantia, informes, seguimientos }`). GET /v1/pasantias/mi-pasantia
   */
  async obtenerMiPasantia() {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.MI_PASANTIA);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener su trámite de pasantía');
    }
  }

  /** Informes del trámite (P11, `informes`). GET /v1/pasantias/:id/informes */
  async obtenerInformes(id) {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.INFORMES(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los informes del trámite');
    }
  }

  /** Emite un informe + PDF institucional (P12, `informe`). POST /v1/pasantias/:id/informes */
  async crearInforme(id, data) {
    try {
      const response = await apiClient.post(PASANTIAS_ENDPOINTS.INFORMES(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al emitir el informe');
    }
  }

  /** Edita un informe; regenera su PDF (P13, `informe`). PUT /v1/pasantias/:id/informes/:informeId */
  async actualizarInforme(id, informeId, data) {
    try {
      const response = await apiClient.put(PASANTIAS_ENDPOINTS.INFORME(id, informeId), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el informe');
    }
  }

  /**
   * Descarga el PDF de un informe por endpoint autenticado (P14, res.download).
   * NUNCA por URL estática /uploads.
   * GET /v1/pasantias/:id/informes/:informeId/pdf
   */
  async descargarInformePdf(id, informeId) {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.INFORME_PDF(id, informeId), {
        responseType: 'blob',
      });
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'informe_pasantia.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al descargar el PDF del informe');
    }
  }

  /** Seguimientos del trámite (P15, `seguimientos`). GET /v1/pasantias/:id/seguimientos */
  async obtenerSeguimientos(id) {
    try {
      const response = await apiClient.get(PASANTIAS_ENDPOINTS.SEGUIMIENTOS(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los seguimientos del trámite');
    }
  }

  /** Registra un seguimiento (P16, `seguimiento`). POST /v1/pasantias/:id/seguimientos */
  async crearSeguimiento(id, data) {
    try {
      const response = await apiClient.post(PASANTIAS_ENDPOINTS.SEGUIMIENTOS(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar el seguimiento');
    }
  }

  /** Edita un seguimiento (P17, `seguimiento`). PUT /v1/pasantias/:id/seguimientos/:seguimientoId */
  async actualizarSeguimiento(id, seguimientoId, data) {
    try {
      const response = await apiClient.put(
        PASANTIAS_ENDPOINTS.SEGUIMIENTO(id, seguimientoId),
        data,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el seguimiento');
    }
  }

  /**
   * Descarga la hoja de seguimiento por endpoint autenticado (extensión
   * 2026-08-11, res.download). NUNCA por URL estática /uploads.
   * GET /v1/pasantias/:id/seguimientos/:seguimientoId/pdf
   */
  async descargarSeguimientoPdf(id, seguimientoId) {
    try {
      const response = await apiClient.get(
        PASANTIAS_ENDPOINTS.SEGUIMIENTO_PDF(id, seguimientoId),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'seguimiento_pasantia.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al descargar la hoja de seguimiento');
    }
  }
}

export default new PasantiaRepository();
