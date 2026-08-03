/**
 * Interfaz del Repositorio de Proyectos de Grado (módulo TUT · Titulación)
 * Raíz: proyectos_grado + satélites tutoria_* (listado desde la vista 160).
 *
 * Extiende IBaseRepository (arquetipo A: CRUD) con los métodos del contrato
 * T1-T23 de docs/plan/tutorias-plan-desarrollo.md.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IProyectoGradoRepository extends IBaseRepository {
  /**
   * Catálogo de modalidades de grado (T2, `modalidadesGrado`).
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerModalidades() {
    throw new Error('Método obtenerModalidades debe ser implementado');
  }

  /**
   * Bandeja del docente tutor autenticado (T3, `misTutorados`).
   * El backend resuelve el docente por token; NUNCA se envía docenteId.
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMisTutorados() {
    throw new Error('Método obtenerMisTutorados debe ser implementado');
  }

  /**
   * Proyecto del estudiante autenticado (T4, `proyectoGrado`).
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMiProyecto() {
    throw new Error('Método obtenerMiProyecto debe ser implementado');
  }

  /**
   * Asigna tutor; el backend genera el PDF de designación oficial (T10, APROBAR).
   * @param {string|number} _id
   * @param {{tutorId: number}} _data
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async asignarTutor(_id, _data) {
    throw new Error('Método asignarTutor debe ser implementado');
  }

  /**
   * Transición de estado del proyecto (T11, APROBAR). Emite dictamen de
   * viabilidad técnica + PDF cuando corresponde.
   * @param {string|number} _id
   * @param {Object} _data - { estado, observaciones? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async aprobarEtapa(_id, _data) {
    throw new Error('Método aprobarEtapa debe ser implementado');
  }

  /**
   * Agrega un integrante al proyecto (T12, EDITAR, `integrante`).
   * @param {string|number} _id
   * @param {Object} _data - { estudianteId, rol? }
   */
  async agregarIntegrante(_id, _data) {
    throw new Error('Método agregarIntegrante debe ser implementado');
  }

  /**
   * Actualiza rol/estado de un integrante (T13, EDITAR, `integrante`).
   * @param {string|number} _id
   * @param {string|number} _integranteId
   * @param {Object} _data
   */
  async actualizarIntegrante(_id, _integranteId, _data) {
    throw new Error('Método actualizarIntegrante debe ser implementado');
  }

  /**
   * Bitácora del proyecto (T14, `bitacoraEntradas`).
   * @param {string|number} _id
   */
  async obtenerBitacora(_id) {
    throw new Error('Método obtenerBitacora debe ser implementado');
  }

  /**
   * Crea una entrada de bitácora (T15, bitacora·CREAR, `bitacoraEntrada`).
   * @param {string|number} _id
   * @param {Object} _data
   */
  async crearBitacoraEntrada(_id, _data) {
    throw new Error('Método crearBitacoraEntrada debe ser implementado');
  }

  /**
   * Edita una entrada de bitácora (T16, bitacora·EDITAR, `bitacoraEntrada`).
   * @param {string|number} _id
   * @param {string|number} _entradaId
   * @param {Object} _data
   */
  async actualizarBitacoraEntrada(_id, _entradaId, _data) {
    throw new Error('Método actualizarBitacoraEntrada debe ser implementado');
  }

  /**
   * Confirmación de una entrada por el estudiante — firma digital (T17).
   * Guard de pertenencia en el servidor (integrante ACTIVO).
   * @param {string|number} _id
   * @param {string|number} _entradaId
   */
  async confirmarBitacoraEntrada(_id, _entradaId) {
    throw new Error('Método confirmarBitacoraEntrada debe ser implementado');
  }

  /**
   * Avances del proyecto (T18, `avances`).
   * @param {string|number} _id
   */
  async obtenerAvances(_id) {
    throw new Error('Método obtenerAvances debe ser implementado');
  }

  /**
   * Detalle de un avance con su bitácora vinculada (T19, `avance`).
   * @param {string|number} _id
   * @param {string|number} _avanceId
   */
  async obtenerAvance(_id, _avanceId) {
    throw new Error('Método obtenerAvance debe ser implementado');
  }

  /**
   * Sube un archivo de avance PDF/Word — multipart (T20, avance·CREAR, `avance`).
   * @param {string|number} _id
   * @param {FormData} _formData
   */
  async subirAvance(_id, _formData) {
    throw new Error('Método subirAvance debe ser implementado');
  }

  /**
   * Descarga el archivo de un avance por endpoint autenticado (T21, blob).
   * @param {string|number} _id
   * @param {string|number} _avanceId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarAvanceArchivo(_id, _avanceId) {
    throw new Error('Método descargarAvanceArchivo debe ser implementado');
  }

  /**
   * Dictámenes del proyecto (T22, `dictamenes`).
   * @param {string|number} _id
   */
  async obtenerDictamenes(_id) {
    throw new Error('Método obtenerDictamenes debe ser implementado');
  }

  /**
   * Descarga el PDF de un dictamen (T23, proyecto·EXPORTAR, blob).
   * @param {string|number} _id
   * @param {string|number} _dictamenId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarDictamenArchivo(_id, _dictamenId) {
    throw new Error('Método descargarDictamenArchivo debe ser implementado');
  }

  /**
   * PDF de la bitácora mensual del tutor para la DDE (T5, proyecto·EXPORTAR, blob).
   * @param {{mes?: string, gestionId?: number}} _params
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarBitacoraMensual(_params) {
    throw new Error('Método exportarBitacoraMensual debe ser implementado');
  }

  // ==========================================================
  // Extensión 2026-07-31 — Requisitos 1-3 (formulario de modalidad de
  // graduación, reporte de avance por carrera, planilla "10 en 10").
  // ==========================================================

  /**
   * Estudiantes de 3er año elegibles para elegir modalidad de graduación
   * (Requisito 1, proyecto·LISTAR, `estudiantesElegibles`).
   * @param {{params?: {search?: string, carreraId?: number, gestionId?: number}}} [_options]
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerEstudiantesElegibles(_options) {
    throw new Error('Método obtenerEstudiantesElegibles debe ser implementado');
  }

  /**
   * Descarga el PDF del formulario de modalidad de graduación FMDG-1 de un
   * proyecto ya creado (Requisito 1, proyecto·EXPORTAR, blob).
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarFormularioModalidadPdf(_id) {
    throw new Error('Método exportarFormularioModalidadPdf debe ser implementado');
  }

  /**
   * Reporte de avance de tutorías por carrera: resumen agregado + detalle
   * por proyecto (Requisito 2, proyecto·LISTAR, `avanceTutoriaCarrera`).
   * @param {{gestionId?: number, carreraId?: number}} [_params]
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerAvanceTutoriaCarrera(_params) {
    throw new Error('Método obtenerAvanceTutoriaCarrera debe ser implementado');
  }

  /**
   * Descarga el PDF del reporte de avance de tutorías por carrera
   * (Requisito 2, proyecto·EXPORTAR, blob).
   * @param {{gestionId?: number, carreraId?: number}} [_params]
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarAvanceTutoriaCarreraPdf(_params) {
    throw new Error('Método exportarAvanceTutoriaCarreraPdf debe ser implementado');
  }

  /**
   * Planilla de avance de tutorías "10 en 10" (bimestral, 3er año): preview
   * en pantalla (Requisito 3, proyecto·LISTAR, `planillaAvanceTercerAnio`).
   * `carreraId` y `bimestre` son requeridos por el backend.
   * @param {{carreraId: number, gestionId?: number, bimestre: number}} _params
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerPlanillaAvanceTercerAnio(_params) {
    throw new Error('Método obtenerPlanillaAvanceTercerAnio debe ser implementado');
  }

  /**
   * Descarga el Excel de la planilla de avance de tutorías (Requisito 3,
   * proyecto·EXPORTAR, blob).
   * @param {{carreraId: number, gestionId?: number, bimestre: number}} _params
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarPlanillaAvanceTercerAnioExcel(_params) {
    throw new Error('Método exportarPlanillaAvanceTercerAnioExcel debe ser implementado');
  }

  // ==========================================================
  // Extensión 2026-08-01 — Acta de defensa de grado
  // ==========================================================

  /**
   * Actas de defensa del proyecto (N si PSP grupal, tribunal anidado,
   * proyecto·DETALLE, `actasDefensa`).
   * @param {string|number} _id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerActasDefensa(_id) {
    throw new Error('Método obtenerActasDefensa debe ser implementado');
  }

  /**
   * Registra el/los acta(s) de defensa del proyecto (proyecto·APROBAR,
   * `actasDefensa`). Delega en el backend la transición
   * DEFENSA → APROBADO|REPROBADO.
   * @param {string|number} _id
   * @param {Object} _data - { fechaDefensa, horaInicio, horaConclusion?, tribunal[3],
   *   calificaciones[{estudianteId, calificacionFinal}], numeroActa?, observaciones? }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async registrarActaDefensa(_id, _data) {
    throw new Error('Método registrarActaDefensa debe ser implementado');
  }

  /**
   * Descarga el PDF de un acta de defensa (proyecto·EXPORTAR, blob).
   * @param {string|number} _id
   * @param {string|number} _actaId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async exportarActaDefensaPdf(_id, _actaId) {
    throw new Error('Método exportarActaDefensaPdf debe ser implementado');
  }

  /**
   * Anula un acta de defensa EMITIDA (P8, proyecto·APROBAR — mismo permiso
   * que registrar). El backend antepone el motivo a `observaciones`
   * (`"ANULADA: {motivo}"`) y NO revierte la transición del proyecto.
   * @param {string|number} _id
   * @param {string|number} _actaId
   * @param {string} _motivo - 3-500 caracteres
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async anularActaDefensa(_id, _actaId, _motivo) {
    throw new Error('Método anularActaDefensa debe ser implementado');
  }
}
