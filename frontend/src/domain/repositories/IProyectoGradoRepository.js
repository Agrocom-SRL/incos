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
}
