/**
 * Interfaz del Repositorio de Pasantías (módulo TUT · Titulación)
 * Raíz: pasantias (schema 24) + satélites pasantias_informes y
 * pasantias_seguimientos + catálogo pasantias_empresas (listado desde la
 * vista 167, ficha desde la 168).
 *
 * Extiende IBaseRepository (arquetipo A: CRUD) con los métodos del contrato
 * P1-P19 de docs/plan/titulacion-y-dominios-pendientes.md §Fase 2.
 *
 * Clean Architecture:
 * - Domain Layer: Abstracción del repositorio (interfaz)
 * - Define el contrato que debe cumplir la implementación
 */

import { IBaseRepository } from '@repositories/IBaseRepository';

export class IPasantiaRepository extends IBaseRepository {
  /**
   * Catálogo de empresas de pasantía (P7, `pasantiasEmpresas`).
   * @param {Object} _options - { params: { incluirInactivos?, ... } }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerEmpresas(_options) {
    throw new Error('Método obtenerEmpresas debe ser implementado');
  }

  /**
   * Alta de una empresa en el catálogo (P8, empresa·CREAR, `pasantiaEmpresa`).
   * @param {Object} _data
   */
  async crearEmpresa(_data) {
    throw new Error('Método crearEmpresa debe ser implementado');
  }

  /**
   * Edición de una empresa del catálogo (P9, empresa·EDITAR, `pasantiaEmpresa`).
   * @param {string|number} _empresaId
   * @param {Object} _data
   */
  async actualizarEmpresa(_empresaId, _data) {
    throw new Error('Método actualizarEmpresa debe ser implementado');
  }

  /**
   * Activa/desactiva una empresa (P10, empresa·ACTIVAR, `pasantiaEmpresa`).
   * @param {string|number} _empresaId
   * @param {boolean} _activo
   */
  async cambiarEstadoEmpresa(_empresaId, _activo) {
    throw new Error('Método cambiarEstadoEmpresa debe ser implementado');
  }

  /**
   * Bandeja del docente supervisor autenticado (P18, `misPasantias`).
   * El backend resuelve el docente por token; NUNCA se envía docenteId.
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMisPasantias() {
    throw new Error('Método obtenerMisPasantias debe ser implementado');
  }

  /**
   * Trámite compuesto del estudiante autenticado (P19,
   * `{ pasantia, informes, seguimientos }`; pasantia = null si no hay trámite).
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async obtenerMiPasantia() {
    throw new Error('Método obtenerMiPasantia debe ser implementado');
  }

  /**
   * Transición de estado del trámite según la máquina por camino (P6,
   * pasantia·APROBAR, `pasantia`).
   * @param {string|number} _id
   * @param {Object} _data - { estado, observaciones? }
   */
  async transicionar(_id, _data) {
    throw new Error('Método transicionar debe ser implementado');
  }

  /**
   * Informes formales del trámite (P11, `informes`).
   * @param {string|number} _id
   */
  async obtenerInformes(_id) {
    throw new Error('Método obtenerInformes debe ser implementado');
  }

  /**
   * Emite un informe; el backend genera el PDF institucional (P12,
   * informe·CREAR, `informe`).
   * @param {string|number} _id
   * @param {Object} _data
   */
  async crearInforme(_id, _data) {
    throw new Error('Método crearInforme debe ser implementado');
  }

  /**
   * Edita un informe; el backend regenera su PDF (P13, informe·EDITAR, `informe`).
   * @param {string|number} _id
   * @param {string|number} _informeId
   * @param {Object} _data
   */
  async actualizarInforme(_id, _informeId, _data) {
    throw new Error('Método actualizarInforme debe ser implementado');
  }

  /**
   * Descarga el PDF de un informe por endpoint autenticado (P14,
   * pasantia·EXPORTAR, blob) — nunca por URL estática /uploads.
   * @param {string|number} _id
   * @param {string|number} _informeId
   * @returns {Promise<{success: boolean, blob?: Blob, fileName?: string, error?: string}>}
   */
  async descargarInformePdf(_id, _informeId) {
    throw new Error('Método descargarInformePdf debe ser implementado');
  }

  /**
   * Seguimientos del trámite en orden cronológico (P15, `seguimientos`).
   * @param {string|number} _id
   */
  async obtenerSeguimientos(_id) {
    throw new Error('Método obtenerSeguimientos debe ser implementado');
  }

  /**
   * Registra un seguimiento (P16, seguimiento·CREAR, `seguimiento`).
   * @param {string|number} _id
   * @param {Object} _data
   */
  async crearSeguimiento(_id, _data) {
    throw new Error('Método crearSeguimiento debe ser implementado');
  }

  /**
   * Edita un seguimiento (P17, seguimiento·EDITAR, `seguimiento`).
   * @param {string|number} _id
   * @param {string|number} _seguimientoId
   * @param {Object} _data
   */
  async actualizarSeguimiento(_id, _seguimientoId, _data) {
    throw new Error('Método actualizarSeguimiento debe ser implementado');
  }
}
