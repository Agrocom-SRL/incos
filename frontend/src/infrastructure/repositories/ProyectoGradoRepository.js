/**
 * Implementación del Repositorio de Proyectos de Grado (módulo TUT · Titulación)
 * Implementa IProyectoGradoRepository usando API client
 *
 * Single Responsibility: Solo maneja llamadas HTTP para proyectos de grado y
 * sus satélites (integrantes, bitácora, avances, dictámenes).
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación técnica usando HTTP
 * - NO contiene lógica de negocio (solo HTTP calls)
 * - Retorna datos crudos del backend (camelCase, mappers TUT del backend)
 *
 * Contrato T1-T23: docs/plan/tutorias-plan-desarrollo.md (dataFieldName literales).
 */

import apiClient from '@api-client';
import { IProyectoGradoRepository } from '@domain/repositories';
import { PROYECTOS_GRADO_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

/** Nombre de archivo desde Content-Disposition (patrón exportarInscritos de CAP). */
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

export class ProyectoGradoRepository extends IProyectoGradoRepository {
  /**
   * Listado de proyectos de grado (T1, vista 160, `proyectosGrado`).
   * GET /v1/proyectos-grado?search=&carreraId=&modalidadId=&estado=&gestionId=
   */
  async obtenerTodos(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.BASE, { params });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los proyectos de grado');
    }
  }

  /** Ficha completa de un proyecto (T6, `proyectoGrado`). GET /v1/proyectos-grado/:id */
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el proyecto de grado');
    }
  }

  /** Catálogo de modalidades (T2, `modalidadesGrado`). GET /v1/proyectos-grado/modalidades */
  async obtenerModalidades() {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.MODALIDADES);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener las modalidades de grado');
    }
  }

  /** Bandeja del tutor autenticado (T3, `misTutorados`). GET /v1/proyectos-grado/mis-tutorados */
  async obtenerMisTutorados() {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.MIS_TUTORADOS);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener sus proyectos tutorados');
    }
  }

  /** Proyecto del estudiante autenticado (T4, `proyectoGrado`). GET /v1/proyectos-grado/mi-proyecto */
  async obtenerMiProyecto() {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.MI_PROYECTO);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener su proyecto de grado');
    }
  }

  /** Crea un proyecto — TITULAR + integrantes si PSP (T7). POST /v1/proyectos-grado */
  async crear(data) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.BASE, data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear el proyecto de grado');
    }
  }

  /** Actualiza un proyecto (T8). PUT /v1/proyectos-grado/:id */
  async actualizar(id, data) {
    try {
      const response = await apiClient.put(PROYECTOS_GRADO_ENDPOINTS.BY_ID(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el proyecto de grado');
    }
  }

  /** Elimina (soft delete) un proyecto (T9). DELETE /v1/proyectos-grado/:id */
  async eliminar(id) {
    try {
      const response = await apiClient.delete(PROYECTOS_GRADO_ENDPOINTS.BY_ID(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar el proyecto de grado');
    }
  }

  /** Asigna tutor + PDF de designación oficial (T10, APROBAR). POST /v1/proyectos-grado/:id/tutor */
  async asignarTutor(id, data) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.TUTOR(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al asignar el tutor del proyecto');
    }
  }

  /** Transición de estado (T11, APROBAR). POST /v1/proyectos-grado/:id/transiciones */
  async aprobarEtapa(id, data) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.TRANSICIONES(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la transición del proyecto');
    }
  }

  /** Agrega un integrante (T12, `integrante`). POST /v1/proyectos-grado/:id/integrantes */
  async agregarIntegrante(id, data) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.INTEGRANTES(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al agregar el integrante');
    }
  }

  /** Actualiza un integrante (T13, `integrante`). PATCH /v1/proyectos-grado/:id/integrantes/:integranteId */
  async actualizarIntegrante(id, integranteId, data) {
    try {
      const response = await apiClient.patch(
        PROYECTOS_GRADO_ENDPOINTS.INTEGRANTE(id, integranteId),
        data,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar el integrante');
    }
  }

  /** Bitácora del proyecto (T14, `bitacoraEntradas`). GET /v1/proyectos-grado/:id/bitacora */
  async obtenerBitacora(id) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.BITACORA(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la bitácora del proyecto');
    }
  }

  /** Crea una entrada de bitácora (T15, `bitacoraEntrada`). POST /v1/proyectos-grado/:id/bitacora */
  async crearBitacoraEntrada(id, data) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.BITACORA(id), data);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al registrar la entrada de bitácora');
    }
  }

  /** Edita una entrada de bitácora (T16, `bitacoraEntrada`). PUT /v1/proyectos-grado/:id/bitacora/:entradaId */
  async actualizarBitacoraEntrada(id, entradaId, data) {
    try {
      const response = await apiClient.put(
        PROYECTOS_GRADO_ENDPOINTS.BITACORA_ENTRADA(id, entradaId),
        data,
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la entrada de bitácora');
    }
  }

  /**
   * Confirmación del estudiante — firma digital de la planilla (T17).
   * POST /v1/proyectos-grado/:id/bitacora/:entradaId/confirmar
   */
  async confirmarBitacoraEntrada(id, entradaId) {
    try {
      const response = await apiClient.post(
        PROYECTOS_GRADO_ENDPOINTS.BITACORA_CONFIRMAR(id, entradaId),
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al confirmar la entrada de bitácora');
    }
  }

  /** Avances del proyecto (T18, `avances`). GET /v1/proyectos-grado/:id/avances */
  async obtenerAvances(id) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.AVANCES(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los avances del proyecto');
    }
  }

  /** Detalle de un avance (T19, `avance`). GET /v1/proyectos-grado/:id/avances/:avanceId */
  async obtenerAvance(id, avanceId) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.AVANCE(id, avanceId));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el avance');
    }
  }

  /**
   * Sube un archivo de avance PDF/Word (T20, `avance`, multipart
   * uploadAvanceProyecto). Sin Content-Type manual: axios pone el boundary.
   * POST /v1/proyectos-grado/:id/avances
   */
  async subirAvance(id, formData) {
    try {
      const response = await apiClient.post(PROYECTOS_GRADO_ENDPOINTS.AVANCES(id), formData);
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al subir el avance del proyecto');
    }
  }

  /**
   * Descarga el archivo de un avance por endpoint autenticado (T21, res.download).
   * NUNCA por URL estática /uploads.
   * GET /v1/proyectos-grado/:id/avances/:avanceId/archivo
   */
  async descargarAvanceArchivo(id, avanceId) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.AVANCE_ARCHIVO(id, avanceId),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'avance_proyecto.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al descargar el archivo del avance');
    }
  }

  /** Dictámenes del proyecto (T22, `dictamenes`). GET /v1/proyectos-grado/:id/dictamenes */
  async obtenerDictamenes(id) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.DICTAMENES(id));
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los dictámenes del proyecto');
    }
  }

  /**
   * Descarga el PDF de un dictamen (T23, proyecto·EXPORTAR).
   * GET /v1/proyectos-grado/:id/dictamenes/:dictamenId/archivo
   */
  async descargarDictamenArchivo(id, dictamenId) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.DICTAMEN_ARCHIVO(id, dictamenId),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'dictamen_proyecto.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al descargar el dictamen');
    }
  }

  /**
   * PDF de la bitácora mensual del tutor para la DDE (T5, proyecto·EXPORTAR).
   * GET /v1/proyectos-grado/reportes/bitacora-mensual?mes=&gestionId=
   */
  async exportarBitacoraMensual(params = {}) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.REPORTE_BITACORA_MENSUAL(params),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'bitacora_mensual_titulacion.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al exportar la bitácora mensual');
    }
  }

  // ==========================================================
  // Extensión 2026-07-31 — Requisitos 1-3 (formulario de modalidad de
  // graduación, reporte de avance por carrera, planilla "10 en 10").
  // ==========================================================

  /**
   * Estudiantes de 3er año elegibles para elegir modalidad de graduación
   * (Requisito 1, `estudiantesElegibles`).
   * GET /v1/proyectos-grado/estudiantes-elegibles?search=&carreraId=&gestionId=
   */
  async obtenerEstudiantesElegibles(options = {}) {
    try {
      const { params = {} } = options;
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.ESTUDIANTES_ELEGIBLES, {
        params,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener los estudiantes elegibles');
    }
  }

  /**
   * Descarga el PDF del formulario de modalidad de graduación FMDG-1
   * (Requisito 1, proyecto·EXPORTAR; blob autenticado).
   * GET /v1/proyectos-grado/:id/formulario-modalidad/pdf
   */
  async exportarFormularioModalidadPdf(id) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.FORMULARIO_MODALIDAD_PDF(id),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'formulario_modalidad_graduacion.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al exportar el formulario de modalidad de graduación');
    }
  }

  /**
   * Reporte de avance de tutorías por carrera (Requisito 2, `avanceTutoriaCarrera`).
   * GET /v1/proyectos-grado/reportes/avance-carrera?gestionId=&carreraId=
   */
  async obtenerAvanceTutoriaCarrera(params = {}) {
    try {
      const response = await apiClient.get(PROYECTOS_GRADO_ENDPOINTS.REPORTE_AVANCE_CARRERA, {
        params,
      });
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener el reporte de avance de tutorías por carrera');
    }
  }

  /**
   * Descarga el PDF del reporte de avance de tutorías por carrera
   * (Requisito 2, proyecto·EXPORTAR; blob autenticado).
   * GET /v1/proyectos-grado/reportes/avance-carrera/pdf?gestionId=&carreraId=
   */
  async exportarAvanceTutoriaCarreraPdf(params = {}) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.REPORTE_AVANCE_CARRERA_PDF(params),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'reporte_avance_tutorias_carrera.pdf'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al exportar el reporte de avance de tutorías por carrera');
    }
  }

  /**
   * Planilla de avance de tutorías "10 en 10" (bimestral, 3er año) — preview
   * en pantalla (Requisito 3, `planillaAvanceTercerAnio`). `carreraId` y
   * `bimestre` son requeridos por el backend.
   * GET /v1/proyectos-grado/reportes/planilla-avance-tercer-anio?carreraId=&gestionId=&bimestre=
   */
  async obtenerPlanillaAvanceTercerAnio(params = {}) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.REPORTE_PLANILLA_AVANCE_TERCER_ANIO,
        { params },
      );
      return handleSuccessResponse(response);
    } catch (error) {
      return handleErrorResponse(error, 'Error al obtener la planilla de avance de tutorías');
    }
  }

  /**
   * Descarga el Excel de la planilla de avance de tutorías (Requisito 3,
   * proyecto·EXPORTAR; blob autenticado).
   * GET /v1/proyectos-grado/reportes/planilla-avance-tercer-anio/export?carreraId=&gestionId=&bimestre=
   */
  async exportarPlanillaAvanceTercerAnioExcel(params = {}) {
    try {
      const response = await apiClient.get(
        PROYECTOS_GRADO_ENDPOINTS.REPORTE_PLANILLA_AVANCE_TERCER_ANIO_EXPORT(params),
        { responseType: 'blob' },
      );
      return {
        success: true,
        blob: response.data,
        fileName: parseFileName(response, 'planilla_avance_tutoria.xlsx'),
      };
    } catch (error) {
      return parseBlobError(error, 'Error al exportar la planilla de avance de tutorías');
    }
  }
}

export default new ProyectoGradoRepository();
