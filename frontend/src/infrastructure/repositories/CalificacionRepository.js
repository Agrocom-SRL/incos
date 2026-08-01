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
   * GET /v1/calificaciones/centralizador?paraleloGestionId=<entero>
   *
   * Matriz estudiantes × asignaturas de un paralelo en gestión.
   * El backend ya entrega los nombres en camelCase y el nombre completo del
   * estudiante con el orden canónico (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES);
   * este repositorio no transforma el payload.
   *
   * @param {Object} options
   * @param {number} options.paraleloGestionId
   * @returns {Promise<{success: boolean, data?: { paraleloGestionId, gestionId, asignaturas, estudiantes }, error?: string}>}
   */
  async obtenerCentralizador({ paraleloGestionId } = {}) {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.CENTRALIZADOR, {
        params: { paraleloGestionId },
      });
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
          paraleloGestionId: payload.paraleloGestionId ?? null,
          gestionId: payload.gestionId ?? null,
          gestionAnio: payload.gestionAnio ?? null,
          gestionNombre: payload.gestionNombre ?? null,
          notaMinimaAprobacion: payload.notaMinimaAprobacion ?? null,
          // Cabecera del Libro de registro del paralelo (schema 25): null si el
          // paralelo aún no tiene folios generados en la gestión — nunca un
          // placeholder inventado.
          libro: payload.libro ?? null,
          asignaturas: Array.isArray(payload.asignaturas) ? payload.asignaturas : [],
          estudiantes: Array.isArray(payload.estudiantes) ? payload.estudiantes : [],
        },
      };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el centralizador del paralelo');
    }
  }

  /**
   * PUT /v1/calificaciones/centralizador/:paraleloGestionId/bimestre/:bimestre/observaciones/:estudianteId
   *
   * @param {Object} options
   * @param {number} options.paraleloGestionId
   * @param {number} options.bimestre
   * @param {number} options.estudianteId
   * @param {string|null} options.observacion
   */
  async guardarObservacionCentralizadorBimestre({
    paraleloGestionId,
    bimestre,
    estudianteId,
    observacion,
  } = {}) {
    try {
      const response = await apiClient.put(
        CALIFICACIONES_ENDPOINTS.CENTRALIZADOR_OBSERVACION(
          paraleloGestionId,
          bimestre,
          estudianteId,
        ),
        { observacion: observacion ?? null },
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
      return handleErrorResponse(error, 'Error al guardar la observación del bimestre');
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
      return handleErrorResponse(error, 'Error al cargar sus cursos');
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

  /** GET /v1/calificaciones/gestion-cronograma */
  async obtenerGestionCronograma() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.GESTION_CRONOGRAMA);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el cronograma de la gestión');
    }
  }

  /** GET /v1/calificaciones/cronograma — datos de administración (actividades + periodos + catálogo). */
  async listarCronogramaAdmin() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.CRONOGRAMA_ADMIN);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el cronograma');
    }
  }

  /** GET /v1/calificaciones/cronograma/:id — detalle de una actividad del calendario. */
  async obtenerActividadCronograma(id) {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.CRONOGRAMA_ADMIN_BY_ID(id));
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar la actividad');
    }
  }

  /** POST /v1/calificaciones/cronograma */
  async crearActividadCronograma(data) {
    try {
      const response = await apiClient.post(CALIFICACIONES_ENDPOINTS.CRONOGRAMA_ADMIN, data);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la actividad');
    }
  }

  /** PUT /v1/calificaciones/cronograma/:id */
  async actualizarActividadCronograma(id, data) {
    try {
      const response = await apiClient.put(CALIFICACIONES_ENDPOINTS.CRONOGRAMA_ADMIN_BY_ID(id), data);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar la actividad');
    }
  }

  /** DELETE /v1/calificaciones/cronograma/:id */
  async eliminarActividadCronograma(id) {
    try {
      const response = await apiClient.delete(CALIFICACIONES_ENDPOINTS.CRONOGRAMA_ADMIN_BY_ID(id));
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la actividad');
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

  /** POST /v1/calificaciones/gestion-bimestres/bimestre/:n/abrir */
  async abrirBimestreGestion(numero) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.GESTION_BIMESTRES_ABRIR(numero),
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
      const mapped = handleErrorResponse(error, 'Error al abrir el bimestre');
      if (error?.response?.data?.code) mapped.code = error.response.data.code;
      return mapped;
    }
  }

  /** GET /v1/calificaciones/gestion-bimestres/periodos — periodos/etapas de la gestión vigente. */
  async listarPeriodosGestion() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.GESTION_PERIODOS);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar los periodos de la gestión');
    }
  }

  /** PUT /v1/calificaciones/gestion-bimestres/periodos/:id/fechas */
  async actualizarFechasPeriodo(id, { fechaInicio, fechaFin }) {
    try {
      const response = await apiClient.put(CALIFICACIONES_ENDPOINTS.GESTION_PERIODO_FECHAS(id), {
        fechaInicio,
        fechaFin,
      });
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data?.periodo ?? responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al actualizar las fechas del periodo');
    }
  }

  /** POST /v1/calificaciones/gestion-bimestres/periodos — alta de etapa. */
  async crearEtapaPeriodo(payload) {
    try {
      const response = await apiClient.post(CALIFICACIONES_ENDPOINTS.GESTION_PERIODOS, payload);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data?.periodo ?? responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al crear la etapa');
    }
  }

  /** DELETE /v1/calificaciones/gestion-bimestres/periodos/:id */
  async eliminarEtapaPeriodo(id) {
    try {
      const response = await apiClient.delete(CALIFICACIONES_ENDPOINTS.GESTION_PERIODO_BY_ID(id));
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al eliminar la etapa');
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

  async obtenerBimestreConsolidado(asignacionId, bimestre) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.BIMESTRE_CONSOLIDADO(asignacionId, bimestre),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar el consolidado del bimestre');
    }
  }

  /** POST reabrir bimestre de un curso (deja el cuaderno editable). */
  async reabrirBimestreCurso(asignacionId, bimestre) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.BIMESTRE_REABRIR(asignacionId, bimestre),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al reabrir el bimestre');
    }
  }

  /** POST cerrar y consolidar bimestre de un curso. */
  async cerrarBimestreCurso(asignacionId, bimestre) {
    try {
      const response = await apiClient.post(
        CALIFICACIONES_ENDPOINTS.BIMESTRE_CERRAR(asignacionId, bimestre),
      );
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? {} };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cerrar el bimestre');
    }
  }

  /**
   * GET export registro pedagógico bimestral (.xlsx)
   * @param {string|number} asignacionId
   * @param {number} bimestre
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarRegistroPedagogicoExcel(asignacionId, bimestre) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.EXPORT_REGISTRO_PEDAGOGICO(asignacionId, bimestre),
        { responseType: 'blob' },
      );

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'registro_pedagogico.xlsx';
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
              : errObj?.message || json?.message || 'Error al exportar registro pedagógico';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar registro pedagógico');
    }
  }

  /**
   * GET export del Centralizador de un paralelo para un bimestre (.xlsx).
   * @param {Object} params
   * @param {string|number} params.paraleloGestionId
   * @param {number} params.bimestre - 1..4
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarCentralizadorExcel({ paraleloGestionId, bimestre } = {}) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.EXPORT_CENTRALIZADOR(paraleloGestionId, bimestre),
        { responseType: 'blob' },
      );

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'centralizador.xlsx';
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
              : errObj?.message || json?.message || 'Error al exportar centralizador';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar centralizador');
    }
  }

  /**
   * GET export del Centralizador de TODA la carrera para un bimestre (.xlsx multi-hoja).
   *
   * Recibe el `paraleloGestionId` del paralelo actual; el backend DERIVA la carrera
   * y genera una hoja por cada paralelo de esa carrera para el bimestre dado.
   * Mecánica idéntica a `descargarCentralizadorExcel` (descarga blob, respeta el
   * filename del header `Content-Disposition`).
   *
   * @param {Object} params
   * @param {string|number} params.paraleloGestionId
   * @param {number} params.bimestre - 1..4
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarCentralizadorCarreraExcel({ paraleloGestionId, bimestre } = {}) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.EXPORT_CENTRALIZADOR_CARRERA(paraleloGestionId, bimestre),
        { responseType: 'blob' },
      );

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'centralizador_carrera.xlsx';
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
              : errObj?.message || json?.message || 'Error al exportar centralizador de la carrera';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar centralizador de la carrera');
    }
  }

  /**
   * GET export del Centralizador ANUAL de un paralelo (.xlsx, una sola hoja —
   * reutiliza los folios ya generados del Libro de registro). Si el paralelo
   * aún no tiene folios generados, el backend responde 400 con un mensaje
   * claro (se propaga tal cual, sin reemplazarlo).
   *
   * Mecánica idéntica a `descargarCentralizadorExcel` (blob + filename del
   * header `Content-Disposition`).
   * @param {Object} params
   * @param {string|number} params.paraleloGestionId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarCentralizadorAnualExcel({ paraleloGestionId } = {}) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.EXPORT_CENTRALIZADOR_ANUAL(paraleloGestionId),
        { responseType: 'blob' },
      );

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'centralizador_anual.xlsx';
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
              : errObj?.message || json?.message || 'Error al exportar el centralizador anual';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar el centralizador anual');
    }
  }

  /**
   * GET boletín de calificaciones (PDF) de UN estudiante del paralelo en gestión.
   *
   * Mecánica idéntica a `descargarCentralizadorExcel` (descarga blob, respeta el
   * filename del header `Content-Disposition`), pero el binario es un PDF.
   *
   * @param {Object} params
   * @param {string|number} params.paraleloGestionId
   * @param {string|number} params.estudianteId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarBoletinEstudiante({ paraleloGestionId, estudianteId } = {}) {
    try {
      const response = await apiClient.get(
        CALIFICACIONES_ENDPOINTS.EXPORT_BOLETIN_ESTUDIANTE(paraleloGestionId, estudianteId),
        { responseType: 'blob' },
      );

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'Boletin.pdf';
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
              : errObj?.message || json?.message || 'Error al exportar el boletín del estudiante';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar el boletín del estudiante');
    }
  }

  /**
   * Portal del estudiante: boletín del estudiante AUTENTICADO.
   * GET /v1/calificaciones/mi-boletin
   *
   * El backend resuelve al estudiante y su paralelo en gestión desde el token.
   * Entrega el nombre completo y las notas ya calculadas; no se transforma.
   *
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMiBoletin() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.MI_BOLETIN);
      const responseData = response.data;
      if (responseData.success === false) {
        return { success: false, error: responseData.error || 'Error en la respuesta del servidor' };
      }
      if (responseData.error) {
        return { success: false, error: responseData.error };
      }
      return { success: true, data: responseData.data ?? null };
    } catch (error) {
      return handleErrorResponse(error, 'Error al cargar su boletín');
    }
  }

  /**
   * Portal del estudiante: boletín del estudiante AUTENTICADO en PDF.
   * GET /v1/calificaciones/mi-boletin/pdf
   *
   * Mecánica idéntica a `descargarBoletinEstudiante` (descarga blob, respeta el
   * filename del header `Content-Disposition`).
   *
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarMiBoletin() {
    try {
      const response = await apiClient.get(CALIFICACIONES_ENDPOINTS.MI_BOLETIN_PDF, {
        responseType: 'blob',
      });

      const disposition = response.headers['content-disposition'] || '';
      const starMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      const quotedMatch = disposition.match(/filename="([^"]+)"/i);
      const plainMatch = disposition.match(/filename=([^;\s]+)/i);

      let fileName = 'Boletin.pdf';
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
              : errObj?.message || json?.message || 'Error al exportar su boletín';
          return { success: false, error: msg };
        } catch {
          /* fall through */
        }
      }
      return handleErrorResponse(error, 'Error al exportar su boletín');
    }
  }

}

export default new CalificacionRepository();
